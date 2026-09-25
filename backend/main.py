import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.model_engine import UrbanHeatModelEngine, CITY_COORDINATES

try:
    from openai import OpenAI
    openai_available = True
except ImportError:
    openai_available = False

app = FastAPI(
    title="Urban Heat Island AI Optimizer API",
    description="Backend API powering satellite-driven thermal mapping, XGBoost predictions, SHAP XAI, and OpenAI LLM copilot.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engines: Dict[str, UrbanHeatModelEngine] = {}

def get_engine(city: str) -> UrbanHeatModelEngine:
    city_key = city if city in CITY_COORDINATES else "Delhi"
    if city_key not in engines:
        engines[city_key] = UrbanHeatModelEngine(city_key=city_key)
    return engines[city_key]


class SimulationRequest(BaseModel):
    city: Optional[str] = "Delhi"
    zone_id: str
    delta_ndvi: float = 0.15
    delta_albedo: float = 0.20
    delta_ndbi: float = -0.10


class AIChatRequest(BaseModel):
    user_query: str
    city: Optional[str] = "Delhi"
    selected_zone_id: Optional[str] = None
    simulation_context: Optional[Dict[str, Any]] = None


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Urban Heat AI Backend",
        "openai_available": openai_available,
        "openai_key_configured": bool(os.getenv("OPENAI_API_KEY"))
    }


@app.get("/api/cities")
def list_cities():
    return {
        "cities": [
            {"key": k, "name": v["name"], "lat": v["lat"], "lon": v["lon"]}
            for k, v in CITY_COORDINATES.items()
        ]
    }


@app.get("/api/grid")
def get_grid(city: str = Query("Delhi")):
    engine = get_engine(city)
    grid_data = engine.get_grid_data()
    city_info = CITY_COORDINATES.get(city, CITY_COORDINATES["Delhi"])
    return {
        "city": city,
        "center": {"lat": city_info["lat"], "lon": city_info["lon"]},
        "total_zones": len(grid_data),
        "zones": grid_data
    }


@app.post("/api/simulate")
def simulate_intervention(req: SimulationRequest):
    engine = get_engine(req.city)
    result = engine.simulate_zone_intervention(
        zone_id=req.zone_id,
        delta_ndvi=req.delta_ndvi,
        delta_albedo=req.delta_albedo,
        delta_ndbi=req.delta_ndbi
    )
    return result


@app.get("/api/roi-ranking")
def get_roi_ranking(city: str = Query("Delhi"), limit: int = Query(10)):
    engine = get_engine(city)
    rankings = engine.get_top_roi_rankings(top_n=limit)
    return {
        "city": city,
        "count": len(rankings),
        "candidates": rankings
    }


@app.get("/api/scenarios")
def get_preset_scenarios():
    return {
        "scenarios": [
            {
                "id": "cool_roofs_directive",
                "name": "Cool Roofs Directive 2026",
                "description": "High reflectance coating across flat concrete rooftops.",
                "delta_ndvi": 0.05,
                "delta_albedo": 0.35,
                "delta_ndbi": -0.05
            },
            {
                "id": "urban_canopy_expansion",
                "name": "Aggressive Urban Greening",
                "description": "Massive tree planting, pocket parks, and bioswales.",
                "delta_ndvi": 0.35,
                "delta_albedo": 0.10,
                "delta_ndbi": -0.15
            },
            {
                "id": "depave_sprawl",
                "name": "Permeable Pavement & De-paving",
                "description": "Replacing impermeable asphalt with permeable pavers.",
                "delta_ndvi": 0.15,
                "delta_albedo": 0.15,
                "delta_ndbi": -0.30
            }
        ]
    }


# ==============================================================================
# OpenAI API Integration Endpoints
# ==============================================================================

@app.post("/api/ai-chat")
def ai_climate_copilot(req: AIChatRequest):
    """
    OpenAI API Integration Method 1 & 2:
    Interactive AI Climate Copilot answering urban heat questions with context.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key or not openai_available:
        # Fallback intelligent rule-based AI response if key is missing
        return {
            "query": req.user_query,
            "response": (
                f"🤖 [Urban AI Copilot - Rule Engine Context]\n\n"
                f"Regarding your query on '{req.user_query}' in {req.city}:\n"
                f"- For zone {req.selected_zone_id or 'hotspot'}, increasing roof albedo by +0.25 yields immediate ~1.2°C cooling per hectare.\n"
                f"- Greening canopy (NDVI +0.20) provides long-term evapotranspirative cooling of up to 2.1°C.\n\n"
                f"💡 Note: Set `export OPENAI_API_KEY='your_key'` to activate live GPT-4o conversational intelligence!"
            ),
            "source": "rule_fallback"
        }

    try:
        client = OpenAI(api_key=api_key)
        system_prompt = (
            "You are an expert AI Urban Climate Policy Specialist & Thermal Dynamics Engineer. "
            "Help city planners optimize urban heat mitigation using satellite indices (NDVI vegetation, NDBI built-up, albedo rooftop reflectance, LST surface temperature). "
            "Give concise, actionable, professional recommendations with budget estimates."
        )

        user_content = (
            f"City Context: {req.city}\n"
            f"Selected Zone: {req.selected_zone_id or 'General'}\n"
            f"Simulation Data Context: {req.simulation_context or 'N/A'}\n\n"
            f"User Query: {req.user_query}"
        )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.7,
            max_tokens=350
        )

        reply = completion.choices[0].message.content

        return {
            "query": req.user_query,
            "response": reply,
            "source": "gpt-4o-mini"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API Error: {str(e)}")


@app.post("/api/ai-policy-brief")
def generate_ai_policy_brief(sim_data: Dict[str, Any]):
    """
    OpenAI API Integration Method 3:
    Generates an executive natural-language policy directive brief for city councils.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    zone_id = sim_data.get("zone_id", "Zone")
    drop = sim_data.get("temp_reduction_degC", 1.5)
    cost = sim_data.get("cost_breakdown", {}).get("total_usd", 25000)

    if not api_key or not openai_available:
        return {
            "brief": (
                f"### Executive Climate Directive: {zone_id}\n"
                f"1. **Target Objective**: Achieve a projected **{drop}°C Land Surface Temperature reduction**.\n"
                f"2. **Budget Allocation**: Total estimated capital expenditure of **${cost:,.0f}**.\n"
                f"3. **Key Mandate**: Prioritize high-albedo solar reflective roofs (+0.20 albedo) and corridor tree planting.\n"
                f"\n*(Tip: Add your `OPENAI_API_KEY` to generate real-time GPT-4o customized executive directives!)*"
            ),
            "source": "template"
        }

    try:
        client = OpenAI(api_key=api_key)
        prompt = (
            f"Draft a succinct, formal 3-paragraph Urban Climate Executive Directive based on this simulation:\n"
            f"- Target Zone: {zone_id}\n"
            f"- Baseline Temp: {sim_data.get('baseline_lst')}°C\n"
            f"- Simulated Post-Intervention Temp: {sim_data.get('simulated_lst')}°C\n"
            f"- Expected Cooling Drop: {drop}°C\n"
            f"- Total Investment: ${cost:,.0f}\n"
            f"- SHAP Drivers: {sim_data.get('shap_attribution')}\n"
            "Format with Markdown headers: Executive Summary, Intervention Mandates, and ROI Justification."
        )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior urban climate policy advisor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400
        )

        return {
            "brief": completion.choices[0].message.content,
            "source": "gpt-4o-mini"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI Generation Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
