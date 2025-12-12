"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Elements() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let modelRef: THREE.Object3D | null = null;
    const mouse = { x: 0, y: 0 };

    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b7e2ff"); // Sketchfab sky blue

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Soft, pastel tone like Sketchfab
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.35;

    mountRef.current.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 65);

    // Load Model
    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.load("/models/scene.gltf", (gltf) => {
      const model = gltf.scene;
      modelRef = model;

      model.rotation.x = 0.25;
      model.rotation.y = -0.3;
      model.scale.set(0.5, 0.5, 0.5);

      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material.flatShading = true;
            child.material.needsUpdate = true;
          }
        }
      });

      scene.add(model);

      // Animations
      mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
    });

    // ⭐ Background
    scene.background = new THREE.Color("#b7e2ff");

    // 🌤 Hemisphere Light (soft ambient)
    const hemiLight = new THREE.HemisphereLight("#cfe8ff", "#9bb3c8", 1.3);
    scene.add(hemiLight);

    // ☀ Directional Sun Light (low angle for visible shadows)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
    sunLight.position.set(-15, 8, 12); // lower angle → visible front shadows
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.15; // ❤️ makes shadows actually appear
    sunLight.shadow.radius = 4;

    scene.add(sunLight);

    // 💡 Soft ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    // 🔆 subtle cool environment light 
    const envLight = new THREE.AmbientLight("#ff9f5e", 0.35);
    scene.add(envLight);

    // 🎨 Tone mapping
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Mouse Move Interactivity
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Render Loop
    gsap.ticker.add((_, dt) => {
      const delta = dt / 1000;

      if (mixer) mixer.update(delta);

      // Smooth rotation based on mouse
      if (modelRef) {
        gsap.to(modelRef.rotation, {
          x: 0.25 + mouse.y * 0.1,
          y: -0.3 + mouse.x * 0.2,
          duration: 0.6,
          ease: "power2.out",
        });
      }

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

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
