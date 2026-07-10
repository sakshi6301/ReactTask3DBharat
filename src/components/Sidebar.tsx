import React from 'react';
import { Settings, Info, Loader2, Zap, Ruler, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  pointSize: number;
  setPointSize: (val: number) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  bgColor: string;
  setBgColor: (val: string) => void;
  totalPoints: number | null;
  isLoading: boolean;
  cameraPos: [number, number, number];
  
  elevationColoring: boolean;
  setElevationColoring: (val: boolean) => void;
  clipY: number;
  setClipY: (val: number) => void;
  measurementMode: boolean;
  setMeasurementMode: (val: boolean) => void;
  measuredDistance: number | null;
  onResetCamera: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  pointSize,
  setPointSize,
  opacity,
  setOpacity,
  bgColor,
  setBgColor,
  totalPoints,
  isLoading,
  cameraPos,
  elevationColoring,
  setElevationColoring,
  clipY,
  setClipY,
  measurementMode,
  setMeasurementMode,
  measuredDistance,
  onResetCamera
}) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isOpen ? 320 : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-gray-900/80 backdrop-blur-2xl border-r border-gray-700/50 flex flex-col h-full overflow-hidden shadow-2xl z-10 relative shrink-0"
    >
      <div className="w-80 flex flex-col h-full overflow-y-auto custom-scrollbar">
        
        {/* Controls Section (Restored Point Size and Opacity) */}
        <div className="p-6 border-b border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/10 blur-[50px] -z-10 rounded-full"></div>
          
          <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white drop-shadow-md">
            <Settings className="w-5 h-5 text-blue-400" /> Controls
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">Point Size</label>
                <span className="text-xs bg-gray-800/80 px-2 py-1 rounded-md text-teal-300 border border-gray-700/50 font-mono shadow-inner">{pointSize.toFixed(3)}</span>
              </div>
              <input 
                type="range" min="0.001" max="0.2" step="0.001" value={pointSize}
                onChange={(e) => setPointSize(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-teal-400 transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">Opacity</label>
                <span className="text-xs bg-gray-800/80 px-2 py-1 rounded-md text-teal-300 border border-gray-700/50 font-mono shadow-inner">{opacity.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-teal-400 transition-all"
              />
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <label className="text-sm font-medium text-gray-300">Background</label>
              <input 
                type="color" value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Advanced Tools Section */}
        <div className="p-6 border-b border-gray-700/50 relative">
          <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white drop-shadow-md">
            <Zap className="w-5 h-5 text-purple-400" /> Advanced Tools
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
              setElevationColoring(!elevationColoring);
            }}>
              <label className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors cursor-pointer">Elevation Heatmap</label>
              <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${elevationColoring ? 'bg-purple-500' : 'bg-gray-600'}`}>
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${elevationColoring ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors">Y-Axis Slicing</label>
                <span className="text-xs bg-gray-800/80 px-2 py-1 rounded-md text-purple-300 border border-gray-700/50 font-mono shadow-inner">{clipY}</span>
              </div>
              <input 
                type="range" min="-100" max="100" step="1" value={clipY}
                onChange={(e) => setClipY(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
              />
            </div>

            <div className="space-y-3 group">
               <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Measure Tool
                  </label>
                  <div onClick={() => setMeasurementMode(!measurementMode)} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${measurementMode ? 'bg-orange-500' : 'bg-gray-600'}`}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${measurementMode ? 'translate-x-5' : ''}`}></div>
                  </div>
               </div>
               {measurementMode && (
                 <div className="text-xs text-orange-300 bg-orange-900/30 p-2 rounded border border-orange-500/30">
                   Click two points on the model to measure distance.
                   {measuredDistance !== null && (
                      <div className="mt-2 font-bold text-orange-400 font-mono text-sm">Dist: {measuredDistance.toFixed(2)} units</div>
                   )}
                 </div>
               )}
            </div>

            <div>
              <button 
                onClick={onResetCamera}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600"
              >
                <RefreshCw className="w-4 h-4" /> Reset Camera
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="p-6">
          <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white drop-shadow-md">
            <Info className="w-5 h-5 text-teal-400" /> Information
          </h2>
          
          <div className="space-y-5 bg-gradient-to-b from-gray-800/60 to-gray-900/60 p-5 rounded-2xl border border-gray-700/50 shadow-lg backdrop-blur-md">
            <div className="group">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1.5 group-hover:text-gray-400 transition-colors">Status</div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="animate-pulse">Loading data...</span>
                  </>
                ) : (
                  <span className="text-green-400 flex items-center gap-2 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    Ready
                  </span>
                )}
              </div>
            </div>

            <div className="group">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1.5 group-hover:text-gray-400 transition-colors">Total Points</div>
              <div className="text-lg text-teal-300 font-mono font-medium drop-shadow-sm">
                {totalPoints !== null ? totalPoints.toLocaleString() : '--'}
              </div>
            </div>

            <div className="group">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 group-hover:text-gray-400 transition-colors">Camera Position</div>
              <div className="grid grid-cols-3 gap-2">
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis} className="bg-gray-800/80 rounded-lg p-2 text-center border border-gray-700/50 shadow-inner">
                    <div className="text-[10px] text-gray-500 mb-0.5">{axis}</div>
                    <div className="text-xs text-gray-300 font-mono">{cameraPos[i].toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
