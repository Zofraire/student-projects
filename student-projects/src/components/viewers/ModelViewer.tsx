"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Center, Stage } from "@react-three/drei";
import { Button } from "@/src/components/ui/button";
import { RotateCcw, Maximize2, Download } from "lucide-react";

interface ModelViewerProps {
  url: string;
  title?: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelCanvas({ url }: { url: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.5}>
          <Center>
            <Model url={url} />
          </Center>
        </Stage>
        <OrbitControls
          autoRotate
          autoRotateSpeed={1}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Suspense>
    </Canvas>
  );
}

export default function ModelViewer({ url, title }: ModelViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

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

  return (
    <div
      id="model-viewer-container"
      className="flex flex-col rounded-lg border bg-card overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title || "3D Model"}</h3>
        </div>
        <div className="flex items-center gap-1">
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
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading 3D model...</p>
              </div>
            </div>
          }
        >
          <ModelCanvas key={key} url={url} />
        </Suspense>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 rounded-md bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>
    </div>
  );
}
