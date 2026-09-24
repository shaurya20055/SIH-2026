import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei';

// `dragging` is a ref shared with OrbitControls so the auto-spin can pause while the user grabs the brain
export function Model({ dragging, ...props }) {
  const group = useRef();
  // Ensure the model is loaded properly. We use primitive to render the loaded scene.
  const { scene } = useGLTF('/Brain_Model.glb');

  useEffect(() => {
    // Attempt to hide any background planes or bounding boxes
    scene.traverse((node) => {
      if (node.isMesh) {
        const name = (node.name || '').toLowerCase();
        if (name.includes('plane') || name.includes('cube') || name.includes('bg') || name.includes('background') || name.includes('box')) {
          node.visible = false;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    // Slow auto-rotation (paused while the user is dragging)
    if (group.current && !dragging?.current) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model for faster loading
useGLTF.preload('/Brain_Model.glb');

export default function BrainModel3D() {
  const dragging = useRef(false);

  return (
    <div
      style={{ width: '100%', height: '100%', minHeight: '500px', cursor: 'grab', position: 'relative', zIndex: 10 }}
      onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
      onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
      onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#d946ef" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />
        <Environment preset="city" />
        <Float
          speed={2}
          rotationIntensity={0.3}
          floatIntensity={0.8}
          floatingRange={[-0.05, 0.05]}
        >
          <Model dragging={dragging} scale={1.5} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} />
        </Float>
        {/* Rotate is now enabled so the brain can be grabbed and turned; zoom/pan stay off */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          autoRotate={false}
          onStart={() => { dragging.current = true; }}
          onEnd={() => { dragging.current = false; }}
        />
      </Canvas>
    </div>
  );
}