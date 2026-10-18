"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const Netflix3DAmbient: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      scrollVelocity = Math.max(Math.min(delta * 0.4, 25), -25);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize 3D particles (Cinematic embers & floating light nodes)
    const PARTICLE_COUNT = 55;
    const colors: string[] = [
      "rgba(229, 9, 20, ", // Netflix Crimson
      "rgba(255, 60, 60, ", // Radiant Red
      "rgba(255, 215, 0, ",  // Gold Amber
      "rgba(180, 20, 25, ", // Deep Blood Wine
      "rgba(255, 255, 255, ", // White spark
    ];

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const selectedColor = colors[Math.floor(Math.random() * colors.length)] ?? "rgba(229, 9, 20, ";
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 800 + 100, // 3D depth layer
        size: Math.random() * 2.5 + 1.2,
        color: selectedColor,
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    let frame = 0;

    const render = () => {
      frame++;
      // Decay scroll velocity smoothly
      scrollVelocity *= 0.92;

      ctx.clearRect(0, 0, width, height);

      // Subtle 3D perspective mouse tilt origin
      const fov = 450;
      const centerX = width / 2 + (mouseX - width / 2) * 0.05;
      const centerY = height / 2 + (mouseY - height / 2) * 0.05;

      particles.forEach((p) => {
        // Move particle based on depth and scroll velocity
        p.pulsePhase += p.pulseSpeed;
        const currentOpacity =
          p.opacity * (0.6 + 0.4 * Math.sin(p.pulsePhase));

        // 3D parallax movement: deeper particles move slower, closer move faster
        const depthFactor = 600 / (p.z || 600);
        p.y -= (p.speed + scrollVelocity * 0.12) * depthFactor;
        p.x += Math.sin(frame * 0.01 + p.z) * 0.2 * depthFactor;

        // Wrap around 3D screen space
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        // Project 3D coordinates to 2D screen
        const scale = fov / (fov + p.z);
        const projX = (p.x - centerX) * scale + centerX;
        const projY = (p.y - centerY) * scale + centerY;
        const projSize = Math.max(p.size * scale * (1 + Math.abs(scrollVelocity) * 0.03), 0.5);

        // Render glowing particle
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(currentOpacity, 0.85)})`;
        ctx.shadowBlur = projSize * 4;
        ctx.shadowColor = p.color === colors[0] ? "#E50914" : "rgba(229, 9, 20, 0.5)";
        ctx.fill();

        // If high scroll velocity, draw 3D motion streak
        if (Math.abs(scrollVelocity) > 2) {
          ctx.beginPath();
          ctx.moveTo(projX, projY);
          ctx.lineTo(projX, projY + scrollVelocity * scale * 2.5);
          ctx.strokeStyle = `${p.color}${Math.min(currentOpacity * 0.7, 0.6)})`;
          ctx.lineWidth = projSize * 0.8;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Dynamic 3D Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[#0c0d12]" />
      
      {/* Netflix Cinematic Atmospheric Light Pools */}
      <div className="absolute -top-32 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-[#E50914]/15 via-red-900/5 to-transparent blur-[140px] pointer-events-none transform -translate-x-1/2" />
      <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#B81D24]/12 via-[#1f1025]/20 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#E50914]/10 via-[#0a0a14]/30 to-transparent blur-[150px] pointer-events-none" />

      {/* 3D Interactive Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70 mix-blend-screen"
      />

      {/* Subtle Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.75)_100%)] pointer-events-none" />
    </div>
  );
};

