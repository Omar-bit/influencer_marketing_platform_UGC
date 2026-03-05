import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  PerspectiveCamera,
  Environment,
  useProgress,
} from '@react-three/drei';
import { BACKEND_URL } from '@/utils/secrets';

// Component to display loading progress
function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center'>
        <div className='flex justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mb-2'></div>
        </div>
        <p className='text-gray-700 dark:text-gray-300'>
          Loading 3D model... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

// Component that renders the 3D GLB model
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<any>(null);

  // Optional: Add some gentle animation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={2.0}
      position={[0, -1, 0]}
    />
  );
}

// Camera setup component
function CameraSetup() {
  const { camera, gl } = useThree();

  React.useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// Main ThreeDViewer component
export default function ThreeDViewer({ modelPath }: { modelPath: string }) {
  const fullModelPath = modelPath.startsWith('http')
    ? modelPath
    : `${BACKEND_URL}/uploads/${modelPath}`;

  return (
    <div className='w-full h-[50vh] relative'>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Model url={fullModelPath} />
        <Environment preset='sunset' />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <CameraSetup />
      </Canvas>
      <React.Suspense fallback={<LoadingIndicator />}>
        {/* This ensures the loading indicator shows while the model is loading */}
      </React.Suspense>
    </div>
  );
}
