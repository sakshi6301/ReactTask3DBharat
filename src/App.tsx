import { useState } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Viewer3D from './components/Viewer3D';

function App() {
  const [pointSize, setPointSize] = useState<number>(0.08);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [bgColor, setBgColor] = useState<string>('#111827');
  
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 0, 10]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Advanced Tools State
  const [elevationColoring, setElevationColoring] = useState<boolean>(false);
  const [clipY, setClipY] = useState<number>(50); // Default clipping plane high up
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [resetCameraSignal, setResetCameraSignal] = useState<number>(0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-white relative">
      {/* Premium animated background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none"></div>
      
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden z-10">
        <Sidebar 
          isOpen={isSidebarOpen}
          pointSize={pointSize}
          setPointSize={setPointSize}
          opacity={opacity}
          setOpacity={setOpacity}
          bgColor={bgColor}
          setBgColor={setBgColor}
          totalPoints={totalPoints}
          isLoading={isLoading}
          cameraPos={cameraPos}
          elevationColoring={elevationColoring}
          setElevationColoring={setElevationColoring}
          clipY={clipY}
          setClipY={setClipY}
          measurementMode={measurementMode}
          setMeasurementMode={setMeasurementMode}
          measuredDistance={measuredDistance}
          onResetCamera={() => setResetCameraSignal(Date.now())}
        />
        <main className="flex-1 relative h-full w-full">
          <Viewer3D 
            pointSize={pointSize}
            opacity={opacity}
            bgColor={bgColor}
            setTotalPoints={setTotalPoints}
            setIsLoading={setIsLoading}
            setCameraPos={setCameraPos}
            elevationColoring={elevationColoring}
            clipY={clipY}
            measurementMode={measurementMode}
            setMeasuredDistance={setMeasuredDistance}
            resetCameraSignal={resetCameraSignal}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
