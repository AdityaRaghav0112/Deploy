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

    const scene = new THREE.Scene();

    let mixer: THREE.AnimationMixer | null = null;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 65);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mountRef.current.appendChild(renderer.domElement);

    // Load Model
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

      mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
    });

    // Lighting
    scene.add(new THREE.HemisphereLight("#d8ecff", "#ffe6c7", 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(10, 20, -10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    scene.add(new THREE.DirectionalLight(0xffd8b1, 0.8));
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Mouse Move
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Render Loop
    gsap.ticker.add((_, dt) => {
      const delta = dt / 1000;
      if (mixer) mixer.update(delta);

      // 🔥 MODEL REACTS TO MOUSE — THIS RUNS EVERY FRAME
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

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
