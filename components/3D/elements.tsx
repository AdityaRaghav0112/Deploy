"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Elements() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();

    // Sketchfab uses this color style
    // scene.background = new THREE.Color("#bcdcff"); // soft sky blue like screenshot

    let mixer: THREE.AnimationMixer | null = null;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // CRITICAL: Sketchfab-like soft rendering
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // proper color space
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mountRef.current.appendChild(renderer.domElement);

    // Load Model
    const loader = new GLTFLoader();
    loader.load("/models/scene.gltf", (gltf) => {
      const model = gltf.scene;

      model.rotation.x = 0.25;
      model.rotation.y = -0.3;

      model.scale.set(0.5, 0.5, 0.5);

      // SELF SHADOWING
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Sketchfab-like shading
          if (child.material) {
            child.material.flatShading = true; // low-poly look
            child.material.needsUpdate = true;
          }
        }
      });

      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
    });

    // 🎨 --- SKETCHFAB LIGHTING SETUP --- 🎨

    // 1️⃣ Hemisphere Light (sky + ground color)
    const hemiLight = new THREE.HemisphereLight(
      "#d8ecff", // sky blue
      "#ffe6c7", // warm ground bounce
      1.2
    );
    scene.add(hemiLight);

    // 2️⃣ Key Light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(10, 20, -10);
    keyLight.castShadow = true;

    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0004;

    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.camera.left = -50;
    keyLight.shadow.camera.right = 50;
    keyLight.shadow.camera.top = 50;
    keyLight.shadow.camera.bottom = -50;

    scene.add(keyLight);

    // 3️⃣ Warm Fill Light
    const fillLight = new THREE.DirectionalLight(0xffd8b1, 0.8);
    fillLight.position.set(-15, 10, -5);
    scene.add(fillLight);

    // 4️⃣ Soft Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Render Loop
    gsap.ticker.add((_, dt) => {
      const delta = dt / 1000;
      if (mixer) mixer.update(delta);

      controls.update();
      renderer.render(scene, camera);
    });

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;

      width = mountRef.current.clientWidth;
      height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
