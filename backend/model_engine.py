import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
import shap
from typing import Dict, Any, List

CITY_COORDINATES = {
    "Delhi": {"lat": 28.6139, "lon": 77.2090, "name": "Delhi NCR, India"},
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714, "name": "Ahmedabad, India"},
    "Phoenix": {"lat": 33.4484, "lon": -112.0740, "name": "Phoenix, AZ, USA"},
    "Tokyo": {"lat": 35.6762, "lon": 139.6503, "name": "Tokyo, Japan"}
}

class UrbanHeatModelEngine:
    def __init__(self, city_key: str = "Delhi", n_rows: int = 25, n_cols: int = 25):
        self.city_key = city_key
        self.n_rows = n_rows
        self.n_cols = n_cols
        self.feature_cols = ["ndvi", "ndbi", "albedo", "bldg_density", "wind_speed"]
        self.df_grid = self.generate_synthetic_urban_grid(city_key, n_rows, n_cols)
        self.model, self.explainer = self.train_model()

    def generate_synthetic_urban_grid(self, city_key: str, n_rows: int, n_cols: int) -> pd.DataFrame:
        np.random.seed(42 if city_key == "Delhi" else hash(city_key) % 1000)
        coords = CITY_COORDINATES.get(city_key, CITY_COORDINATES["Delhi"])
        lat_center, lon_center = coords["lat"], coords["lon"]
        lat_step, lon_step = 0.0035, 0.0035

        records = []
        cell_id = 0

        for r in range(n_rows):
            for c in range(n_cols):
                cell_id += 1
                lat = lat_center + (r - n_rows // 2) * lat_step
                lon = lon_center + (c - n_cols // 2) * lon_step

                # Spatial distance from core
                dist_from_core = np.sqrt((r - n_rows / 2) ** 2 + (c - n_cols / 2) ** 2) / (n_rows / 2)

                bldg_density = np.clip(0.85 - 0.5 * dist_from_core + np.random.normal(0, 0.08), 0.05, 0.95)
                ndbi = np.clip(0.6 * bldg_density - 0.2 + np.random.normal(0, 0.05), -0.3, 0.7)
                ndvi = np.clip(0.7 - 0.7 * bldg_density + np.random.normal(0, 0.06), 0.02, 0.85)
                albedo = np.clip(0.15 + 0.1 * (1 - bldg_density) + np.random.normal(0, 0.03), 0.08, 0.45)
                wind_speed = np.clip(3.5 - 1.8 * bldg_density + np.random.normal(0, 0.2), 0.5, 6.0)

                # Ground truth physics-informed LST equation
                lst = (
                    31.0 + (14.0 * ndbi) - (9.0 * ndvi) - (7.5 * albedo) +
                    (6.0 * bldg_density) - (0.7 * wind_speed) + np.random.normal(0, 0.35)
                )

                records.append({
                    "zone_id": f"Zone_{cell_id:04d}",
                    "row": r,
                    "col": c,
                    "lat": round(float(lat), 6),
                    "lon": round(float(lon), 6),
                    "ndvi": round(float(ndvi), 3),
                    "ndbi": round(float(ndbi), 3),
                    "albedo": round(float(albedo), 3),
                    "bldg_density": round(float(bldg_density), 3),
                    "wind_speed": round(float(wind_speed), 2),
                    "lst": round(float(lst), 2),
                })

        return pd.DataFrame(records)

    def train_model(self):
        X = self.df_grid[self.feature_cols]
        y = self.df_grid["lst"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        try:
            from xgboost import XGBRegressor
            model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
            model.fit(X_train, y_train)
        except Exception:
            from sklearn.ensemble import GradientBoostingRegressor
            model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
            model.fit(X_train, y_train)

        explainer = shap.TreeExplainer(model)
        return model, explainer

    def get_grid_data(self) -> List[Dict[str, Any]]:
        return self.df_grid.to_dict(orient="records")

    def simulate_zone_intervention(
        self,
        zone_id: str,
        delta_ndvi: float = 0.15,
        delta_albedo: float = 0.20,
        delta_ndbi: float = -0.10
    ) -> Dict[str, Any]:
        match = self.df_grid[self.df_grid["zone_id"] == zone_id]
        if match.empty:
            zone_data = self.df_grid.iloc[0]
        else:
            zone_data = match.iloc[0]

        orig_vals = {f: float(zone_data[f]) for f in self.feature_cols}
        sim_vals = {
            "ndvi": float(np.clip(orig_vals["ndvi"] + delta_ndvi, 0.0, 0.85)),
            "ndbi": float(np.clip(orig_vals["ndbi"] + delta_ndbi, -0.4, 0.8)),
            "albedo": float(np.clip(orig_vals["albedo"] + delta_albedo, 0.08, 0.75)),
            "bldg_density": orig_vals["bldg_density"],
            "wind_speed": orig_vals["wind_speed"],
        }

        input_orig = pd.DataFrame([orig_vals])
        input_sim = pd.DataFrame([sim_vals])

        pred_orig_lst = float(self.model.predict(input_orig)[0])
        pred_sim_lst = float(self.model.predict(input_sim)[0])
        temp_delta = pred_sim_lst - pred_orig_lst

        # Financial & Physical Heuristics in Indian Rupees (INR ₹)
        USD_TO_INR = 83.5
        cost_greening = delta_ndvi * 85000 * USD_TO_INR
        cost_cool_roofs = delta_albedo * 35000 * USD_TO_INR
        cost_depaving = abs(delta_ndbi) * 50000 * USD_TO_INR
        total_estimated_cost = float(cost_greening + cost_cool_roofs + cost_depaving)

        # ROI metric: °C cooling drop per ₹1 Lakh (100,000 INR) invested
        roi_metric = abs(temp_delta) / (total_estimated_cost / 100000.0 + 1e-5)

        # SHAP calculation for baseline instance
        shap_vals = self.explainer(input_orig)
        shap_array = shap_vals.values[0]

        feature_names_readable = {
            "ndvi": "Vegetation Canopy (NDVI)",
            "ndbi": "Built-Up Surface (NDBI)",
            "albedo": "Roof Reflectance (Albedo)",
            "bldg_density": "Building Density",
            "wind_speed": "Wind Circulation Speed"
        }

        shap_breakdown = []
        for feat, val in zip(self.feature_cols, shap_array):
            shap_breakdown.append({
                "feature_key": feat,
                "feature_name": feature_names_readable[feat],
                "value": orig_vals[feat],
                "impact_degC": round(float(val), 2),
                "effect": "Increases Heat" if val > 0 else "Cools Surface"
            })

        shap_breakdown = sorted(shap_breakdown, key=lambda x: abs(x["impact_degC"]), reverse=True)

        return {
            "zone_id": zone_data["zone_id"],
            "coordinates": {"lat": zone_data["lat"], "lon": zone_data["lon"]},
            "baseline_lst": round(pred_orig_lst, 2),
            "simulated_lst": round(pred_sim_lst, 2),
            "temp_reduction_degC": round(abs(temp_delta), 2),
            "is_cooling": temp_delta <= 0,
            "original_indices": orig_vals,
            "simulated_indices": sim_vals,
            "cost_breakdown": {
                "urban_greening": round(cost_greening, 2),
                "cool_roofs": round(cost_cool_roofs, 2),
                "depaving": round(cost_depaving, 2),
                "total_inr": round(total_estimated_cost, 2),
                "total_usd": round(total_estimated_cost, 2)
            },
            "roi_efficiency": round(roi_metric, 2),
            "heat_driver_severity": "Severe" if pred_orig_lst > 38 else "Moderate" if pred_orig_lst > 34 else "Low",
            "shap_attribution": shap_breakdown
        }

    def get_top_roi_rankings(self, top_n: int = 10) -> List[Dict[str, Any]]:
        df_copy = self.df_grid.copy()
        candidate_inputs = df_copy[self.feature_cols].copy()
        
        # Standard benchmark policy intervention (+0.25 albedo, +0.15 ndvi)
        candidate_inputs["albedo"] = np.clip(candidate_inputs["albedo"] + 0.25, 0.08, 0.75)
        candidate_inputs["ndvi"] = np.clip(candidate_inputs["ndvi"] + 0.15, 0.0, 0.85)

        pred_sim_batch = self.model.predict(candidate_inputs)
        df_copy["simulated_lst"] = pred_sim_batch
        df_copy["temp_drop"] = df_copy["lst"] - df_copy["simulated_lst"]
        df_copy["efficiency_score"] = (df_copy["temp_drop"] / (df_copy["bldg_density"] + 0.1)).round(2)

        top_df = df_copy.sort_values(by="lst", ascending=False).head(top_n)

        results = []
        for idx, row in top_df.iterrows():
            results.append({
                "zone_id": row["zone_id"],
                "lat": row["lat"],
                "lon": row["lon"],
                "current_lst": round(float(row["lst"]), 2),
                "simulated_lst": round(float(row["simulated_lst"]), 2),
                "temp_drop": round(float(row["temp_drop"]), 2),
                "bldg_density": round(float(row["bldg_density"]), 2),
                "efficiency_score": round(float(row["efficiency_score"]), 2)
            })

        return results
