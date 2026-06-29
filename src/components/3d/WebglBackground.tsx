"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// --------------------------------------------------------
// Custom GLSL Shader Material
// --------------------------------------------------------
const CoreShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uScroll: 0,
    uColor1: new THREE.Color("#7e3bde"), // Purple
    uColor2: new THREE.Color("#06b6d4"), // Cyan
    uColor3: new THREE.Color("#ec4899"), // Pink
  },
  // Vertex Shader
  `
  uniform float uTime;
  uniform float uScroll;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // 3D Simplex Noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;

    // Organic displacement based on noise, time, and scroll
    float noise = snoise(position * 1.5 + uTime * 0.2 + uScroll * 0.5);
    vec3 newPosition = position + normal * (noise * 0.4);

    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Iridescent color mixing
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);

    float mixRatio1 = sin(vUv.x * 10.0 + uTime + uScroll) * 0.5 + 0.5;
    float mixRatio2 = cos(vUv.y * 10.0 - uTime - uScroll) * 0.5 + 0.5;

    vec3 color = mix(uColor1, uColor2, mixRatio1);
    color = mix(color, uColor3, mixRatio2);

    // Make the core dark, and the edges glow with the mixed colors
    vec3 finalColor = color * (fresnel * 2.0 + 0.2); 
    
    // Lower opacity drastically because AdditiveBlending adds all overlapping lines together
    // If opacity is too high, hundreds of overlapping lines will just become pure white.
    gl_FragColor = vec4(finalColor, 0.15);
  }
  `
);

extend({ CoreShaderMaterial });

// --------------------------------------------------------
// The 3D Object
// --------------------------------------------------------
function TrustCore() {
  const materialRef = useRef<any>();
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Track window scroll
  const scrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      // Normalize scroll between 0 and a larger number for the shader
      scrollY.current = window.scrollY * 0.002;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      // Smoothly interpolate the shader's scroll uniform towards the actual scroll
      materialRef.current.uScroll = MathUtils.lerp(
        materialRef.current.uScroll, 
        scrollY.current, 
        0.05
      );
    }
    if (meshRef.current) {
      // Slow constant rotation
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
      
      // Dramatic camera movement on scroll
      state.camera.position.y = MathUtils.lerp(
        state.camera.position.y,
        -scrollY.current * 2,
        0.05
      );
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Lower segment count for a cleaner, less chaotic wireframe */}
      <icosahedronGeometry args={[2.8, 24]} />
      {/* @ts-ignore */}
      <coreShaderMaterial 
        ref={materialRef} 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
        wireframe={true}
      />
    </mesh>
  );
}

// --------------------------------------------------------
// Main Canvas Component
// --------------------------------------------------------
export function WebglBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none">
      {/* Background grain */}
      <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <TrustCore />
      </Canvas>
    </div>
  );
}
