"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center, Html } from "@react-three/drei";
import { Button } from "@/src/components/ui/button";
import { RotateCcw, Maximize2, Download } from "lucide-react";
import * as THREE from "three";

// Dynamic imports for loaders to avoid SSR issues
let FBXLoader: any = null;
let OBJLoader: any = null;
let GLTFLoader: any = null;
let MTLLoader: any = null;

interface ModelViewerProps {
  url: string;
  title?: string;
  format?: string;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </Html>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Html center>
      <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-xs text-center">
        <p className="font-medium">Error loading model</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </Html>
  );
}

interface ModelProps {
  url: string;
  format?: string;
}

function Model({ url, format }: ModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        // Dynamically import loaders
        const THREE_EXAMPLES = await import("three/examples/jsm/loaders/FBXLoader.js");
        FBXLoader = THREE_EXAMPLES.FBXLoader;
        
        const OBJ_LOADER = await import("three/examples/jsm/loaders/OBJLoader.js");
        OBJLoader = OBJ_LOADER.OBJLoader;
        
        const GLTF_LOADER = await import("three/examples/jsm/loaders/GLTFLoader.js");
        GLTFLoader = GLTF_LOADER.GLTFLoader;

        const ext = format?.toLowerCase() || url.split('.').pop()?.toLowerCase() || '';
        
        const loadingManager = new THREE.LoadingManager();

        if (ext === 'fbx') {
          const loader = new FBXLoader(loadingManager);
          loader.load(
            url,
            (object: THREE.Object3D) => {
              if (!isMounted) return;
              
              // FBX models are often very large, scale them down
              const box = new THREE.Box3().setFromObject(object);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 2 / maxDim;
              object.scale.setScalar(scale);
              
              // Center the model
              const center = box.getCenter(new THREE.Vector3());
              object.position.sub(center.multiplyScalar(scale));
              
              setModel(object);
              setLoading(false);
            },
            (progress: ProgressEvent) => {
              console.log('Loading FBX:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
            },
            (err: Error) => {
              if (!isMounted) return;
              console.error('FBX loading error:', err);
              setError(`Failed to load FBX file`);
              setLoading(false);
            }
          );
        } else if (ext === 'obj') {
          const loader = new OBJLoader(loadingManager);
          loader.load(
            url,
            (object: THREE.Object3D) => {
              if (!isMounted) return;
              
              const box = new THREE.Box3().setFromObject(object);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 2 / maxDim;
              object.scale.setScalar(scale);
              
              const center = box.getCenter(new THREE.Vector3());
              object.position.sub(center.multiplyScalar(scale));
              
              // Add default material if none exists
              object.traverse((child: any) => {
                if (child.isMesh && !child.material) {
                  child.material = new THREE.MeshStandardMaterial({ color: 0x888888 });
                }
              });
              
              setModel(object);
              setLoading(false);
            },
            (progress: ProgressEvent) => {
              console.log('Loading OBJ:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
            },
            (err: Error) => {
              if (!isMounted) return;
              console.error('OBJ loading error:', err);
              setError(`Failed to load OBJ file`);
              setLoading(false);
            }
          );
        } else if (['glb', 'gltf'].includes(ext)) {
          const loader = new GLTFLoader(loadingManager);
          loader.load(
            url,
            (gltf: any) => {
              if (!isMounted) return;
              
              const object = gltf.scene;
              const box = new THREE.Box3().setFromObject(object);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 2 / maxDim;
              object.scale.setScalar(scale);
              
              const center = box.getCenter(new THREE.Vector3());
              object.position.sub(center.multiplyScalar(scale));
              
              setModel(object);
              setLoading(false);
            },
            (progress: ProgressEvent) => {
              console.log('Loading GLTF:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
            },
            (err: Error) => {
              if (!isMounted) return;
              console.error('GLTF loading error:', err);
              setError(`Failed to load GLTF file`);
              setLoading(false);
            }
          );
        } else {
          setError(`Unsupported 3D format: ${ext}. Supported formats: FBX, OBJ, GLB, GLTF`);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Model loading error:', err);
        setError(err.message || 'Failed to load model');
        setLoading(false);
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [url, format]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!model) {
    return <ErrorDisplay message="No model loaded" />;
  }

  return <primitive object={model} />;
}

export default function ModelViewer({ url, title, format }: ModelViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  const handleFullscreen = () => {
    const element = document.getElementById("model-viewer-container");
    if (!document.fullscreenElement) {
      element?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Detect format from URL if not provided
  const detectedFormat = format || url.split('.').pop()?.toLowerCase();

  return (
    <div
      id="model-viewer-container"
      className="flex flex-col rounded-lg border bg-card overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title || "3D Model"}</h3>
          {detectedFormat && (
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded uppercase">
              {detectedFormat}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-xs"
          >
            {autoRotate ? "Stop" : "Rotate"}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={url} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="relative h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <Canvas
          key={key}
          camera={{ position: [0, 1, 4], fov: 50 }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.4} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
            
            <Center>
              <Model url={url} format={detectedFormat} />
            </Center>
            
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={1.5}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={1}
              maxDistance={20}
            />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 rounded-md bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>
    </div>
  );
}
