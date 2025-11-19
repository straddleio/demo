import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader for a "Digital Rain" / Cyber-grid background
// Optimized for performance (single draw call)

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec3 iColor;
  varying vec2 vUv;

  // Random function
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
      vec2 uv = vUv;

      // Subtle grid effect (reduced scale for less noise)
      float gridScale = 20.0;
      vec2 gridUv = fract(uv * gridScale);
      vec2 gridId = floor(uv * gridScale);

      // Slower, subtler digital rain
      float dropSpeed = 0.5 + random(vec2(gridId.x, 0.0)) * 0.5;
      float dropPos = fract(iTime * 0.2 * dropSpeed + random(vec2(gridId.x, 1.0)));

      // More subtle trail effect
      float trail = smoothstep(0.2, 0.8, (1.0 - distance(gridUv.y, dropPos)));
      trail *= step(gridUv.y, dropPos); // Only trail behind

      // Reduced character noise frequency
      float charNoise = step(0.7, random(vec2(gridId.x, gridId.y + floor(iTime * 5.0))));

      // Much more subtle overall
      float alpha = trail * charNoise * 0.15;

      // Subtle grid lines
      float gridLine = step(0.98, gridUv.x) + step(0.98, gridUv.y);
      alpha += gridLine * 0.02;

      // Atmospheric fog gradient (bottom to top)
      float fog = smoothstep(0.0, 0.6, uv.y) * 0.1;
      alpha += fog;

      // Stronger vignette for focus
      float vig = 1.0 - distance(uv, vec2(0.5)) * 1.5;
      vig = smoothstep(0.0, 1.0, vig);

      vec3 finalColor = iColor * alpha;
      gl_FragColor = vec4(finalColor, alpha * vig * 0.6);
  }
`;

export const CyberBackground: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iColor: { value: new THREE.Color('#00FFFF') },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      uniforms.iTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -10]} scale={[30, 30, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
