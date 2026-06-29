"use client";

import { useEffect, useRef } from "react";
// @ts-ignore
import Matter from "matter-js";

export function PhysicsSandbox() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

    // Provide the engine
    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const width = sceneRef.current.clientWidth;
    const height = 300; // Fixed height for this widget

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;
    Render.run(render);

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Add bodies
    const wallOptions = { isStatic: true, render: { visible: false } };
    Composite.add(world, [
      // walls
      Bodies.rectangle(width / 2, -10, width, 20, wallOptions), // top
      Bodies.rectangle(width / 2, height + 10, width, 20, wallOptions), // bottom
      Bodies.rectangle(-10, height / 2, 20, height, wallOptions), // left
      Bodies.rectangle(width + 10, height / 2, 20, height, wallOptions), // right
    ]);

    // Add some playful "Trust Badges"
    const colors = ["#3d6ef6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];
    for (let i = 0; i < 5; i++) {
      const radius = 25 + Math.random() * 15;
      const x = width / 2 + (Math.random() - 0.5) * 100;
      const y = -100 - Math.random() * 200;
      Composite.add(
        world,
        Bodies.circle(x, y, radius, {
          restitution: 0.9,
          render: {
            fillStyle: colors[i % colors.length],
            strokeStyle: "#ffffff",
            lineWidth: 2,
          },
        })
      );
    }
    
    for (let i = 0; i < 4; i++) {
        const size = 40 + Math.random() * 20;
        const x = width / 2 + (Math.random() - 0.5) * 100;
        const y = -200 - Math.random() * 200;
        Composite.add(
            world,
            Bodies.rectangle(x, y, size, size, {
                chamfer: { radius: 10 },
                restitution: 0.6,
                render: {
                  fillStyle: "rgba(255, 255, 255, 0.1)",
                  strokeStyle: "rgba(255, 255, 255, 0.3)",
                  lineWidth: 1,
                },
            })
        );
    }

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse; // Keep the mouse in sync with rendering

    // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) {
          Engine.clear(engineRef.current);
      }
      if (renderRef.current && renderRef.current.canvas) {
        renderRef.current.canvas.remove();
        renderRef.current.canvas = null as any;
        renderRef.current.context = null as any;
        renderRef.current.textures = {};
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900/10 to-transparent border border-border/50">
      <div className="absolute inset-0 z-10 pointer-events-none p-4 opacity-50 select-none">
        <h4 className="font-display text-lg font-bold">Trust Sandbox</h4>
        <p className="text-sm">Drag to interact with physics</p>
      </div>
      <div ref={sceneRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
