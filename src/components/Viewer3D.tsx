import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three-stdlib';

interface Viewer3DProps {
  pointSize: number;
  opacity: number;
  bgColor: string;
  setTotalPoints: (val: number) => void;
  setIsLoading: (val: boolean) => void;
  setCameraPos: (val: [number, number, number]) => void;
  elevationColoring: boolean;
  clipY: number;
  measurementMode: boolean;
  setMeasuredDistance: (val: number | null) => void;
  resetCameraSignal: number;
}

const PLYModel = ({ 
  url, 
  pointSize, 
  opacity,
  elevationColoring,
  clipY,
  measurementMode,
  setMeasuredDistance,
  onLoad,
  onError
}: { 
  url: string; 
  pointSize: number; 
  opacity: number;
  elevationColoring: boolean;
  clipY: number;
  measurementMode: boolean;
  setMeasuredDistance: (val: number | null) => void;
  onLoad: (points: number) => void;
  onError: (error: any) => void;
}) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const originalColorsRef = useRef<Float32Array | null>(null);
  const { raycaster } = useThree();
  
  // Measurement state
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    // Increase hit threshold for point clouds so clicking is easier
    raycaster.params.Points = { threshold: 0.5 };
  }, [raycaster]);

  useEffect(() => {
    if (!measurementMode) {
      setPoints([]);
      setMeasuredDistance(null);
    }
  }, [measurementMode, setMeasuredDistance]);

  useEffect(() => {
    const loader = new PLYLoader();
    loader.load(
      url,
      (geo) => {
        geo.rotateX(-Math.PI / 2);
        geo.computeBoundingBox();
        const center = new THREE.Vector3();
        geo.boundingBox?.getCenter(center);
        geo.translate(-center.x, -center.y, -center.z);
        
        // Save original colors for toggling heatmap and normalize if needed
        if (geo.attributes.color) {
          const colorsArray = geo.attributes.color.array;
          let needsNormalization = false;
          // Check if colors are stored as 0-255 instead of 0.0-1.0
          for (let i = 0; i < colorsArray.length; i++) {
            if (colorsArray[i] > 1.0) {
              needsNormalization = true;
              break;
            }
          }
          
          if (needsNormalization) {
            for (let i = 0; i < colorsArray.length; i++) {
              colorsArray[i] = colorsArray[i] / 255.0;
            }
          }

          originalColorsRef.current = new Float32Array(geo.attributes.color.array);
        }
        
        setGeometry(geo);
        onLoad(geo.attributes.position.count);
      },
      undefined,
      (error) => {
        console.error('Error loading PLY:', error);
        onError(error);
      }
    );
  }, [url, onLoad, onError]);

  // Handle Elevation Coloring
  useEffect(() => {
    if (!geometry) return;
    
    const colors = geometry.attributes.color;
    if (!colors) return;

    if (elevationColoring) {
      // Apply Heatmap
      const positions = geometry.attributes.position;
      let minY = Infinity;
      let maxY = -Infinity;
      
      // Find min/max Y
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      const range = maxY - minY;
      const color = new THREE.Color();
      
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const normalizedY = (y - minY) / range;
        
        // Blue to Red gradient (HSL: 240 to 0)
        color.setHSL((1.0 - normalizedY) * 0.66, 1.0, 0.5);
        colors.setXYZ(i, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
    } else if (originalColorsRef.current) {
      // Restore Original Colors
      for (let i = 0; i < originalColorsRef.current.length; i++) {
        colors.array[i] = originalColorsRef.current[i];
      }
      colors.needsUpdate = true;
    }
  }, [elevationColoring, geometry]);

  useFrame((state) => {
    if (pointsRef.current && !measurementMode) {
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2;
    } else if (pointsRef.current) {
      pointsRef.current.position.y = 0; // Stop floating when measuring
    }
  });

  const handlePointerDown = (e: any) => {
    if (!measurementMode) return;
    e.stopPropagation();
    
    if (points.length >= 2) {
      setPoints([e.point]);
      setMeasuredDistance(null);
    } else {
      const newPoints = [...points, e.point];
      setPoints(newPoints);
      if (newPoints.length === 2) {
        setMeasuredDistance(newPoints[0].distanceTo(newPoints[1]));
      }
    }
  };

  const clippingPlanes = useMemo(() => {
    return [new THREE.Plane(new THREE.Vector3(0, -1, 0), clipY)];
  }, [clipY]);

  if (!geometry) return null;

  return (
    <group>
      <points ref={pointsRef} geometry={geometry} onPointerDown={handlePointerDown}>
        <pointsMaterial 
          size={pointSize} 
          vertexColors={geometry.hasAttribute('color')} 
          color={geometry.hasAttribute('color') ? 0xffffff : '#38bdf8'} 
          transparent={opacity < 1.0} 
          opacity={opacity} 
          sizeAttenuation={true} 
          depthWrite={true}
          clippingPlanes={clippingPlanes}
        />
      </points>
      
      {measurementMode && points.length > 0 && (
        <group>
          {points.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="orange" />
            </mesh>
          ))}
          {points.length === 2 && (
            <Line
              points={[points[0], points[1]]}
              color="orange"
              lineWidth={3}
            />
          )}
        </group>
      )}
    </group>
  );
};

const CameraReporter = ({ setCameraPos }: { setCameraPos: (val: [number, number, number]) => void }) => {
  const { camera } = useThree();
  const lastUpdate = useRef(0);
  
  useFrame(() => {
    const now = Date.now();
    if (now - lastUpdate.current > 250) {
      setCameraPos([camera.position.x, camera.position.y, camera.position.z]);
      lastUpdate.current = now;
    }
  });
  return null;
};

const CameraRig = ({ resetSignal }: { resetSignal: number }) => {
  const { camera } = useThree();
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      camera.position.set(0, 150, 200);
      initialMount.current = false;
    } else if (resetSignal > 0) {
      camera.position.set(0, 50, 100);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, resetSignal]);

  useFrame(() => {
    if (camera.position.length() > 120 && resetSignal === 0) {
      camera.position.lerp(new THREE.Vector3(0, 50, 100), 0.02);
    }
  });
  
  return null;
}

const Viewer3D: React.FC<Viewer3DProps> = ({
  pointSize,
  opacity,
  bgColor,
  setTotalPoints,
  setIsLoading,
  setCameraPos,
  elevationColoring,
  clipY,
  measurementMode,
  setMeasuredDistance,
  resetCameraSignal
}) => {
  const plyUrl = '/dataset.ply';

  return (
    <div className="w-full h-full relative overflow-hidden shadow-inner" style={{ backgroundColor: bgColor }}>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-0"></div>
      
      <Canvas 
        flat
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 60, near: 0.1, far: 5000 }}
        gl={{ localClippingEnabled: true, antialias: true }}
      >
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <PLYModel 
          url={plyUrl}
          pointSize={pointSize}
          opacity={opacity}
          elevationColoring={elevationColoring}
          clipY={clipY}
          measurementMode={measurementMode}
          setMeasuredDistance={setMeasuredDistance}
          onLoad={(count) => {
            setTotalPoints(count);
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
          }}
        />
        
        <CameraRig resetSignal={resetCameraSignal} />
        
        <OrbitControls 
          makeDefault 
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={!measurementMode} // Stop rotating when measuring
          autoRotateSpeed={0.5}
        />
        <CameraReporter setCameraPos={setCameraPos} />
      </Canvas>
    </div>
  );
};

export default React.memo(Viewer3D);
