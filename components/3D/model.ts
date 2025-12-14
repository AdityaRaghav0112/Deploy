import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function initModel(mountEl: HTMLDivElement) {
  let modelRef: THREE.Object3D | null = null;
  let mixer: THREE.AnimationMixer | null = null;

  const mouse = { x: 0, y: 0 };

  let width = mountEl.clientWidth;
  let height = mountEl.clientHeight;

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

  mountEl.innerHTML = "";
  mountEl.appendChild(renderer.domElement);

  /* ================= LIGHTS ================= */
  scene.add(new THREE.HemisphereLight("#cfe8ff", "#9bb3c8", 1.3));

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
  sunLight.position.set(-15, 8, 12);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.15;
  scene.add(sunLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  scene.add(new THREE.AmbientLight("#ff9f5e", 0.35));

  /* ================= MODEL ================= */
  const loader = new GLTFLoader();
  loader.load("/models/scene.gltf", (gltf:any) => {
    modelRef = gltf.scene;

    modelRef.rotation.set(0.25, -0.3, 0);
    modelRef.scale.set(0.5, 0.5, 0.5);

    modelRef.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(modelRef);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(modelRef);
      mixer.clipAction(gltf.animations[0]).play();
    }
  });

  /* ================= CONTROLS ================= */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;

  /* ================= EVENTS ================= */
  const handleMouseMove = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  const handleResize = () => {
    width = mountEl.clientWidth;
    height = mountEl.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("resize", handleResize);

  /* ================= RENDER LOOP ================= */
  const tick = (_: number, dt: number) => {
    const delta = dt / 1000;

    mixer?.update(delta);

    if (modelRef) {
      modelRef.rotation.x +=
        (0.25 + mouse.y * 0.1 - modelRef.rotation.x) * 0.05;
      modelRef.rotation.y +=
        (-0.3 + mouse.x * 0.2 - modelRef.rotation.y) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
  };

  gsap.ticker.add(tick);

  /* ================= CLEANUP ================= */
  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", handleResize);

    controls.dispose();
    renderer.dispose();

    scene.traverse((obj: any) => {
      obj.geometry?.dispose();
      obj.material?.dispose();
    });

    scene.clear();
    mountEl.innerHTML = "";
  };
}
