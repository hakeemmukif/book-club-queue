"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function BookScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    books: THREE.Group[];
    particles: THREE.Points;
    textParticles: THREE.Points;
    mainLight: THREE.PointLight;
    accentLight: THREE.PointLight;
    warmLight: THREE.PointLight;
    featuredBook: THREE.Group;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffeedd, 2, 100);
    mainLight.position.set(0, 10, 20);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x4466ff, 1, 50);
    accentLight.position.set(-20, -10, 10);
    scene.add(accentLight);

    const warmLight = new THREE.PointLight(0xff8844, 1.5, 60);
    warmLight.position.set(10, 5, 15);
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
        roughness: 0.7,
        metalness: 0.1,
        emissive: emissive,
        emissiveIntensity: 0.2,
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
        roughness: 0.6,
        metalness: 0.2,
      });
      const spine = new THREE.Mesh(spineGeometry, spineMaterial);
      spine.position.x = -width / 2;
      group.add(spine);

      return group;
    }

    // Create floating books
    const books: THREE.Group[] = [];
    const bookColors = [
      0x8b0000, 0x1a1a4e, 0x2d4a3e, 0x4a3728, 0x3d2b4a, 0x1e3a5f, 0x4a1a1a,
      0x2a3a2a,
    ];

    for (let i = 0; i < 40; i++) {
      const color = bookColors[Math.floor(Math.random() * bookColors.length)];
      const book = createBook(
        1.5 + Math.random() * 1,
        2 + Math.random() * 1.5,
        0.3 + Math.random() * 0.4,
        color
      );

      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 35;
      const yOffset = (Math.random() - 0.5) * 40;

      book.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius - 20
      );

      book.rotation.set(
        Math.random() * 0.5 - 0.25,
        Math.random() * Math.PI * 2,
        Math.random() * 0.3 - 0.15
      );

      book.userData = {
        originalY: book.position.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
      };

      books.push(book);
      scene.add(book);
    }

    // Featured book (center, glowing)
    const featuredBook = createBook(2.5, 3.5, 0.5, 0x8b4513, 0xffaa55);
    featuredBook.position.set(8, 0, 5);
    featuredBook.rotation.y = -0.3;
    featuredBook.userData = {
      originalY: 0,
      floatSpeed: 0.3,
      floatOffset: 0,
      rotationSpeed: 0.001,
    };
    books.push(featuredBook);
    scene.add(featuredBook);

    // Particle system (dust motes)
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      sizes[i] = Math.random() * 2;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffeedd,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Text fragments (floating letters)
    const textParticleCount = 100;
    const textGeometry = new THREE.BufferGeometry();
    const textPositions = new Float32Array(textParticleCount * 3);

    for (let i = 0; i < textParticleCount; i++) {
      textPositions[i * 3] = (Math.random() - 0.5) * 80;
      textPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      textPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    textGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(textPositions, 3)
    );

    const textMaterial = new THREE.PointsMaterial({
      color: 0xaaaaff,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const textParticles = new THREE.Points(textGeometry, textMaterial);
    scene.add(textParticles);

    // Mouse and scroll tracking
    let scrollY = 0;
    let targetScrollY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousemove", handleMouseMove);

    // Animation
    const clock = new THREE.Clock();

    function animate() {
      const animationId = requestAnimationFrame(animate);
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }

      const time = clock.getElapsedTime();

      // Smooth scroll
      scrollY += (targetScrollY - scrollY) * 0.05;
      const scrollProgress =
        scrollY / (document.body.scrollHeight - window.innerHeight);

      // Smooth mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Camera movement based on scroll
      camera.position.z = 30 - scrollProgress * 20;
      camera.position.y = scrollProgress * -5;
      camera.position.x = mouseX * 3;
      camera.rotation.x = mouseY * 0.1;
      camera.rotation.y = mouseX * 0.1;

      // Animate books
      books.forEach((book) => {
        const data = book.userData;
        book.position.y =
          data.originalY + Math.sin(time * data.floatSpeed + data.floatOffset) * 0.5;
        book.rotation.y += data.rotationSpeed;
      });

      // Featured book special animation
      featuredBook.position.y = Math.sin(time * 0.3) * 0.3;
      warmLight.position.x = featuredBook.position.x + Math.sin(time * 0.5) * 2;
      warmLight.position.y = featuredBook.position.y + Math.cos(time * 0.5) * 2;

      // Animate particles
      const particlePositions = particles.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 1] += 0.01;
        if (particlePositions[i * 3 + 1] > 50) {
          particlePositions[i * 3 + 1] = -50;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.02;

      // Text particles
      textParticles.rotation.y = -time * 0.01;
      textParticles.rotation.x = Math.sin(time * 0.1) * 0.1;

      // Animate lights
      mainLight.intensity = 2 + Math.sin(time * 0.5) * 0.3;
      accentLight.position.x = Math.sin(time * 0.3) * 20;

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
      books,
      particles,
      textParticles,
      mainLight,
      accentLight,
      warmLight,
      featuredBook,
      animationId: 0,
    };

    // Start animation
    animate();

    // Capture the container element for cleanup
    const container = containerRef.current;

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
