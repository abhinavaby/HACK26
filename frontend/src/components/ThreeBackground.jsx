import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 42);

    // WebGL Renderer with High Precision & Alpha
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Futuristic Holographic Earth / Microclimate Sphere (Dual Layer Wireframe)
    const globeRadius = 18;
    const innerGeo = new THREE.IcosahedronGeometry(globeRadius, 4);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xb5f639,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerGlobe);

    const outerGeo = new THREE.IcosahedronGeometry(globeRadius * 1.08, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const outerGlobe = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerGlobe);

    // 2. Thermal Microclimate Glowing Nodes (Particle Array)
    const particleCount = 1200;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);

    const limeColor = new THREE.Color('#b5f639');
    const emeraldColor = new THREE.Color('#10b981');
    const roseColor = new THREE.Color('#f87171');
    const cyanColor = new THREE.Color('#06b6d4');

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles across sphere + surrounding atmosphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2.0;
      const phi = Math.acos(2.0 * v - 1.0);
      const dist = globeRadius * (0.95 + Math.random() * 0.35);

      pPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = dist * Math.cos(phi);

      // Color mapping based on thermal elevation
      const randVal = Math.random();
      let c = limeColor;
      if (randVal > 0.75) c = roseColor;
      else if (randVal > 0.50) c = cyanColor;
      else if (randVal > 0.25) c = emeraldColor;

      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;

      pSizes[i] = 0.8 + Math.random() * 1.6;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 3. Floating Microclimate Grid Plane at Base
    const planeGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xb5f639,
      wireframe: true,
      transparent: true,
      opacity: 0.04
    });
    const gridPlane = new THREE.Mesh(planeGeo, planeMat);
    gridPlane.rotation.x = -Math.PI / 2;
    gridPlane.position.y = -22;
    scene.add(gridPlane);

    // Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate Globes
      innerGlobe.rotation.y = elapsedTime * 0.08;
      innerGlobe.rotation.x = Math.sin(elapsedTime * 0.04) * 0.1;
      outerGlobe.rotation.y = -elapsedTime * 0.05;
      particles.rotation.y = elapsedTime * 0.06;

      // Animate wave on grid plane
      const pos = planeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 0.1 + elapsedTime) * Math.cos(v * 0.1 + elapsedTime) * 1.5;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;

      // Smooth Camera Motion
      camera.position.x += (mouseX * 12 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 12 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      innerGeo.dispose();
      innerMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60 mix-blend-screen overflow-hidden"
    />
  );
}
