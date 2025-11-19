import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { AnimationSequence, lerp, easing } from '../animationUtils';

interface Props {
  hash: string;
  paykeyToken: string;
  onComplete: () => void;
}

/**
 * Minting Stage: Paykey Token Generation Ceremony
 *
 * Timeline (4 seconds total):
 * - 0.0-1.0s: Coin materializes (scale up with rotation)
 * - 1.0-2.5s: Forge effect (rotation slows, glow intensifies)
 * - 2.5-3.5s: Stamp ceremony (coin flattens slightly, hash appears)
 * - 3.5-4.0s: Final reveal (slow rotation, hold)
 */
export const Minting3D: React.FC<Props> = ({ hash, paykeyToken, onComplete }) => {
  const coinRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const animSeq = useRef<AnimationSequence | null>(null);
  const hasStarted = useRef(false);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Initialize animation on first frame
    if (!hasStarted.current) {
      animSeq.current = new AnimationSequence([
        { name: 'materialize', duration: 1.0 },
        { name: 'forge', duration: 1.5 },
        { name: 'stamp', duration: 1.0 },
        { name: 'reveal', duration: 0.5 },
      ]);
      animSeq.current.start(time);
      hasStarted.current = true;
    }

    if (!animSeq.current || !coinRef.current) {
      return;
    }

    const animState = animSeq.current.update(time);
    if (!animState) {
      return;
    }

    // Handle each phase
    switch (animState.phase) {
      case 'materialize': {
        // Coin appears from nothing with spin-up
        const scale = lerp(0, 1, animState.progress, easing.easeOutBack);
        coinRef.current.scale.setScalar(scale);

        // Fast initial rotation that slows
        const rotationSpeed = lerp(0.2, 0.05, animState.progress, easing.easeOutCubic);
        coinRef.current.rotation.y += rotationSpeed;
        coinRef.current.rotation.x = Math.sin(animState.progress * Math.PI) * 0.3;
        break;
      }

      case 'forge': {
        // Rotation continues but slows more
        const rotationSpeed = lerp(0.05, 0.02, animState.progress);
        coinRef.current.rotation.y += rotationSpeed;

        // Ring glows more intensely (handled by ring ref)
        if (ringRef.current) {
          const material = ringRef.current.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = lerp(2, 4, animState.progress, easing.easeInOutCubic);
        }

        // Settle rotation on X axis
        coinRef.current.rotation.x = lerp(coinRef.current.rotation.x, 0, 0.1);
        break;
      }

      case 'stamp': {
        // Coin "stamps" - slight flatten effect
        const flatten = 1 - Math.sin(animState.progress * Math.PI) * 0.1;
        coinRef.current.scale.set(1, flatten, 1);

        // Slow rotation continues
        coinRef.current.rotation.y += 0.015;

        // Ring pulse
        if (ringRef.current) {
          const material = ringRef.current.material as THREE.MeshStandardMaterial;
          const pulse = Math.sin(animState.progress * Math.PI * 4) * 0.5 + 3.5;
          material.emissiveIntensity = pulse;
        }
        break;
      }

      case 'reveal': {
        // Return to normal scale
        const scale = lerp(coinRef.current.scale.y, 1, 0.2);
        coinRef.current.scale.set(1, scale, 1);

        // Very slow final rotation
        coinRef.current.rotation.y += 0.01;

        // Settle ring glow
        if (ringRef.current) {
          const material = ringRef.current.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = lerp(material.emissiveIntensity, 2, 0.1);
        }

        if (animState.isComplete) {
          onComplete();
        }
        break;
      }
    }
  });

  return (
    <group ref={coinRef}>
      {/* The Paykey Coin - Premium Gold Material */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={1}
          roughness={0.08}
          emissive="#FFB700"
          emissiveIntensity={0.3}
          envMapIntensity={2}
        />
      </mesh>

      {/* Coin Edge Detail */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.52, 1.52, 0.18, 64]} />
        <meshStandardMaterial
          color="#FFA500"
          metalness={1}
          roughness={0.2}
          emissive="#FF8800"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner Detail Ring - Neon Accent */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}>
        <ringGeometry args={[1.1, 1.35, 64]} />
        <meshStandardMaterial
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={3}
          metalness={0.3}
          roughness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Center Emblem Circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]}>
        <circleGeometry args={[1.0, 64]} />
        <meshStandardMaterial
          color="#FFC700"
          metalness={1}
          roughness={0.05}
          emissive="#FFB700"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Blake3 Hash (educational - shows what was hashed) */}
      <Text
        position={[0, -2.7, 0]}
        fontSize={0.14}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        BLAKE3: {hash}
      </Text>

      {/* Real Paykey Token */}
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.18}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#664400"
      >
        {paykeyToken}
      </Text>

      {/* STRADDLE Text on Coin */}
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.28}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        letterSpacing={0.05}
      >
        STRADDLE
      </Text>

      {/* Glow halo behind coin */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.15]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};
