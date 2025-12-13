"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Elements() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false); // 🔑 STRICT MODE GUARD

  useEffect(() => {
    if (!mountRef.current || initialized.current) return;
    initialized.current = true;

    let modelRef: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const mouse = { x: 0, y: 0 };

    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();

    /* ================= CAMERA ================= */
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 65);

    /* ================= RENDERER ================= */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.15;

    mountRef.current.appendChild(renderer.domElement);

    /* ================= LIGHTS ================= */
    const hemiLight = new THREE.HemisphereLight("#cfe8ff", "#9bb3c8", 1.3);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
    sunLight.position.set(-15, 8, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.15;
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const envLight = new THREE.AmbientLight("#ff9f5e", 0.35);
    scene.add(envLight);

    /* ================= MODEL ================= */
    const loader = new GLTFLoader();
    loader.load("/models/scene.gltf", (gltf) => {
      const model = gltf.scene;
      modelRef = model;

      model.rotation.set(0.25, -0.3, 0);
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

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
      }
    });

    /* ================= CONTROLS ================= */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    /* ================= EVENTS ================= */
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth;
      height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    /* ================= RENDER LOOP ================= */
    const tick = (_: number, dt: number) => {
      const delta = dt / 1000;

      if (mixer) mixer.update(delta);

      if (modelRef) {
        modelRef.rotation.x += (0.25 + mouse.y * 0.1 - modelRef.rotation.x) * 0.05;
        modelRef.rotation.y += (-0.3 + mouse.x * 0.2 - modelRef.rotation.y) * 0.05;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    gsap.ticker.add(tick);

    /* ================= CLEANUP ================= */
    return () => {
      gsap.ticker.remove(tick); // 🔥 IMPORTANT
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}
