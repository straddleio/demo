import React from 'react';
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CyberBackground } from './CyberBackground';

// Using a dedicated Scene component to handle logic inside the Canvas context
export const Scene: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />

      {/* Three-Point Lighting Setup */}
      {/* Key Light - Main cyan light from front-top-right */}
      <directionalLight position={[5, 8, 5]} intensity={2} color="#00FFFF" castShadow />

      {/* Fill Light - Softer magenta from front-left to fill shadows */}
      <pointLight position={[-6, 4, 4]} intensity={1.2} color="#FF0099" distance={20} decay={2} />

      {/* Rim/Back Light - Gold accent from behind to create depth */}
      <spotLight
        position={[0, 6, -8]}
        intensity={1.5}
        color="#FFD700"
        angle={Math.PI / 3}
        penumbra={0.5}
      />

      {/* Ambient base - Very subtle to maintain contrast */}
      <ambientLight intensity={0.15} color="#ffffff" />

      {/* Accent lights for atmosphere */}
      <pointLight position={[10, -5, -5]} intensity={0.5} color="#0066FF" distance={15} />
      <pointLight position={[-10, -5, -5]} intensity={0.5} color="#FF00FF" distance={15} />

      <CyberBackground />
      <Stars radius={150} depth={60} count={3000} factor={3} saturation={0.2} fade speed={0.5} />

      <Environment preset="night" />

      {children}

      {/* Post-processing for retro neon glow */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
};
