"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function BookScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    featuredBook: THREE.Group;
    particles: THREE.Points;
    warmLight: THREE.PointLight;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffeedd, 1.5, 100);
    mainLight.position.set(10, 10, 20);
    scene.add(mainLight);

    const warmLight = new THREE.PointLight(0xff8844, 2, 60);
    warmLight.position.set(8, 0, 10);
    scene.add(warmLight);

    // Book creation function
    function createBook(
      width: number,
      height: number,
      depth: number,
      color: number,
      emissive: number = 0x000000
    ) {
      const group = new THREE.Group();

      // Book cover
      const coverGeometry = new THREE.BoxGeometry(width, height, depth);
      const coverMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.1,
        emissive: emissive,
        emissiveIntensity: 0.3,
      });
      const cover = new THREE.Mesh(coverGeometry, coverMaterial);
      group.add(cover);

      // Pages
      const pagesGeometry = new THREE.BoxGeometry(
        width * 0.9,
        height * 0.95,
        depth * 0.85
      );
      const pagesMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        roughness: 0.9,
        metalness: 0,
      });
      const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
      pages.position.x = width * 0.03;
      group.add(pages);

      // Spine detail
      const spineGeometry = new THREE.BoxGeometry(depth * 0.1, height, depth);
      const spineMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.7),
        roughness: 0.5,
        metalness: 0.2,
      });
      const spine = new THREE.Mesh(spineGeometry, spineMaterial);
      spine.position.x = -width / 2;
      group.add(spine);

      return group;
    }

    // Featured book (warm amber color like in the screenshot)
    const featuredBook = createBook(2.5, 4, 0.6, 0xb8722d, 0xffaa55);
    // Position on the right side of the screen
    featuredBook.position.set(6, 0, 0);
    featuredBook.rotation.y = -0.4;
    featuredBook.rotation.x = 0.1;
    scene.add(featuredBook);

    // Star particles (subtle background stars)
    const particleCount = 1500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spread particles across a wider area
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20; // Push back
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse tracking for subtle camera movement
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Animation
    const clock = new THREE.Clock();

    function animate() {
      const animationId = requestAnimationFrame(animate);
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }

      const time = clock.getElapsedTime();

      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      // Subtle camera movement based on mouse
      camera.position.x = mouseX * 1.5;
      camera.position.y = -mouseY * 1;
      camera.lookAt(4, 0, 0);

      // Floating book animation
      featuredBook.position.y = Math.sin(time * 0.5) * 0.3;
      featuredBook.rotation.y = -0.4 + Math.sin(time * 0.3) * 0.05;
      featuredBook.rotation.x = 0.1 + Math.cos(time * 0.4) * 0.03;

      // Warm light follows the book
      warmLight.position.x = featuredBook.position.x + Math.sin(time * 0.5) * 1;
      warmLight.position.y = featuredBook.position.y + Math.cos(time * 0.5) * 1;
      warmLight.intensity = 2 + Math.sin(time * 0.8) * 0.3;

      // Slowly rotate particles
      particles.rotation.y = time * 0.01;
      particles.rotation.x = Math.sin(time * 0.05) * 0.02;

      renderer.render(scene, camera);
    }

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Store refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      featuredBook,
      particles,
      warmLight,
      animationId: 0,
    };

    // Start animation
    animate();

    // Capture the container element for cleanup
    const container = containerRef.current;

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }

      renderer.dispose();
      if (container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
