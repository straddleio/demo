import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { GeneratorData } from '@/lib/state';
import { AnimationSequence, lerp, easing, glitchText } from '../animationUtils';

interface Props {
  data: GeneratorData;
  onComplete: () => void;
}

/**
 * Waldo Stage: Identity Name Matching
 *
 * Timeline (4 seconds total):
 * - 0.0-1.0s: Glitch normalization (text randomization settling)
 * - 1.0-2.5s: Name permutations (show variations)
 * - 2.5-3.5s: Match scoring (count up similarity)
 * - 3.5-4.0s: Hold final result
 */
export const Waldo3D: React.FC<Props> = ({ data, onComplete }) => {
  const group = useRef<THREE.Group>(null);
  const [displayText, setDisplayText] = useState(data.customerName.toUpperCase());
  const [similarity, setSimilarity] = useState(0);

  // Animation state
  const animSeq = useRef<AnimationSequence | null>(null);
  const hasStarted = useRef(false);
  const lastFrameTime = useRef(0);

  // Prepare name variants
  const targetName = data.waldoData?.matchedName || data.customerName;
  const variants = [
    data.customerName.toUpperCase(),
    `${data.customerName.toUpperCase()} JR`,
    `MR ${data.customerName.toUpperCase()}`,
    data.customerName.split(' ').reverse().join(', ').toUpperCase(),
    targetName.toUpperCase(),
  ];

  useEffect(() => {
    // Initialize animation sequence
    animSeq.current = new AnimationSequence([
      { name: 'glitch', duration: 1.0 },
      { name: 'permute', duration: 1.5 },
      { name: 'score', duration: 1.0 },
      { name: 'complete', duration: 0.5 },
    ]);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Start animation on first frame
    if (!hasStarted.current && animSeq.current) {
      animSeq.current.start(time);
      hasStarted.current = true;
      lastFrameTime.current = time;
    }

    if (!animSeq.current) {
      return;
    }

    const animState = animSeq.current.update(time);
    if (!animState) {
      return; // Animation complete
    }

    // Handle each phase
    switch (animState.phase) {
      case 'glitch': {
        // Glitch effect with decreasing intensity
        const glitchIntensity = lerp(0.8, 0, animState.progress, easing.easeOutCubic);

        // Update glitch every few frames for performance
        if (time - lastFrameTime.current > 0.05) {
          setDisplayText(glitchText(data.customerName.toUpperCase(), glitchIntensity));
          lastFrameTime.current = time;
        }

        // At end of glitch, show clean name
        if (animState.progress > 0.95) {
          setDisplayText(data.customerName.toUpperCase());
        }
        break;
      }

      case 'permute': {
        // Show name variations with smooth transitions
        const variantProgress = animState.progress * (variants.length - 1);
        const currentIndex = Math.floor(variantProgress);
        const nextIndex = Math.min(currentIndex + 1, variants.length - 1);
        const transitionProgress = variantProgress - currentIndex;

        // Smooth crossfade using easing
        if (transitionProgress < 0.2) {
          setDisplayText(variants[currentIndex]);
        } else if (transitionProgress > 0.8) {
          setDisplayText(variants[nextIndex]);
        } else {
          // Brief glitch during transition
          if (Math.random() > 0.7) {
            setDisplayText(glitchText(variants[currentIndex], 0.3));
          }
        }
        break;
      }

      case 'score': {
        // Smooth score count-up with easing
        const targetScore = data.waldoData?.correlationScore || 98;
        const currentScore = Math.floor(
          lerp(0, targetScore, animState.progress, easing.easeOutCubic)
        );
        setSimilarity(currentScore);

        // Lock in final matched name
        setDisplayText(targetName.toUpperCase());
        break;
      }

      case 'complete': {
        // Hold final state
        if (animState.isComplete) {
          onComplete();
        }
        break;
      }
    }

    // Floating animation for the group
    if (group.current) {
      group.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      group.current.rotation.x = Math.cos(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main Identity Text */}
        <Text
          fontSize={0.5}
          color="#00FFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#004444"
        >
          {displayText}
        </Text>

        {/* Similarity Score */}
        {similarity > 0 && (
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.2}
            color="#00FF99"
            anchorX="center"
            anchorY="middle"
          >
            MATCH_CONFIDENCE: {similarity}%
          </Text>
        )}
      </Float>

      {/* Connection Line to Bank Record (grows in during scoring) */}
      {similarity > 0 && (
        <>
          <mesh position={[0, -1.5, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 4, 16]} />
            <meshStandardMaterial
              color="#00FF99"
              emissive="#00FF99"
              emissiveIntensity={1.5}
              transparent
              opacity={lerp(0, 0.6, similarity / 100, easing.easeOutCubic)}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Pulsing glow sphere at connection point */}
          <mesh position={[0, -3.5, -2]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#00FF99"
              emissive="#00FF99"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
