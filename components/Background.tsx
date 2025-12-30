import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const snowflakes = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedX: Math.random() * 0.3 + 0.1,
      speedY: Math.random() * 0.6 + 0.3,
    }));
    const update = () => {
      for (const f of snowflakes) {
        f.x += f.speedX;
        f.y += f.speedY;
        if (f.y > height) {
          f.y = 0;
          f.x = Math.random() * width;
        }
        if (f.x > width) {
          f.x = 0;
          f.y = Math.random() * height;
        }
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      for (const f of snowflakes) {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      update();
    };
    let raf = 0;
    const animate = () => {
      draw();
      raf = requestAnimationFrame(animate);
    };
    draw();
    animate();
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
  );
}
