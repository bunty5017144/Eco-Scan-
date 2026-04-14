import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Camera, 
  Recycle, 
  Trash2, 
  MapPin, 
  Trophy, 
  ChevronRight, 
  ArrowLeft, 
  Info,
  History,
  Home,
  Code2,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeWaste, generateEcoComposeCode } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Screen = 'welcome' | 'home' | 'scan' | 'result' | 'map' | 'dev';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [scanResult, setScanResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(450);

  const navigateTo = (screen: Screen) => setCurrentScreen(screen);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 font-sans selection:bg-lime-500/30">
      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[400px] h-[800px] bg-stone-900 rounded-[3rem] border-8 border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-between px-8 pt-4 pb-2 z-50 bg-stone-900/80 backdrop-blur-md">
          <span className="text-xs font-medium text-stone-400">12:30</span>
          <div className="flex gap-1.5">
            <div className="w-4 h-4 rounded-full border border-stone-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
            </div>
            <div className="w-6 h-3 border border-stone-600 rounded-sm relative">
              <div className="absolute inset-0.5 bg-lime-500 rounded-[1px] w-3/4" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'welcome' && (
              <WelcomeScreen key="welcome" onStart={() => navigateTo('home')} />
            )}
            {currentScreen === 'home' && (
              <HomeScreen 
                key="home" 
                points={points}
                onNavigate={navigateTo} 
              />
            )}
            {currentScreen === 'scan' && (
              <ScanScreen 
                key="scan" 
                onBack={() => navigateTo('home')} 
                onResult={(res) => {
                  setScanResult(res);
                  setPoints(p => p + 50);
                  navigateTo('result');
                }}
              />
            )}
            {currentScreen === 'result' && (
              <ResultScreen 
                key="result" 
                content={scanResult}
                onBack={() => navigateTo('home')} 
              />
            )}
            {currentScreen === 'map' && (
              <MapScreen key="map" onBack={() => navigateTo('home')} />
            )}
            {currentScreen === 'dev' && (
              <DevScreen key="dev" onBack={() => navigateTo('home')} />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        {currentScreen !== 'welcome' && (
          <div className="h-16 bg-stone-900/90 backdrop-blur-md border-t border-stone-800 flex items-center justify-around px-4 z-50">
            <NavButton icon={Home} active={currentScreen === 'home'} onClick={() => navigateTo('home')} />
            <NavButton icon={Camera} active={currentScreen === 'scan'} onClick={() => navigateTo('scan')} />
            <NavButton icon={MapPin} active={currentScreen === 'map'} onClick={() => navigateTo('map')} />
            <NavButton icon={Code2} active={currentScreen === 'dev'} onClick={() => navigateTo('dev')} />
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-2xl transition-all duration-300",
        active ? "bg-lime-500/10 text-lime-500" : "text-stone-500 hover:text-stone-300"
      )}
    >
      <Icon size={24} />
    </button>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-lime-950/20 to-stone-950"
    >
      <div className="w-24 h-24 bg-lime-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-lime-500/20">
        <Leaf size={48} className="text-stone-950" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">EcoScan AI</h1>
      <p className="text-stone-400 mb-12 leading-relaxed">
        Identify waste instantly and save the planet. Earn points for every item you recycle correctly.
      </p>
      <button 
        onClick={onStart}
        className="w-full bg-lime-500 text-stone-950 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors group"
      >
        Start Scanning
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function HomeScreen({ points, onNavigate }: { points: number, onNavigate: (s: Screen) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Eco Dashboard</h2>
          <p className="text-sm text-stone-500">You've saved 12kg of CO2</p>
        </div>
        <div className="bg-lime-500/10 border border-lime-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Trophy size={14} className="text-lime-500" />
          <span className="text-sm font-bold text-lime-500">{points} pts</span>
        </div>
      </div>

      <div className="bg-stone-800/50 border border-stone-800 rounded-[2rem] p-6 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-1">Daily Challenge</h3>
          <p className="text-sm text-stone-400 mb-4">Recycle 3 plastic bottles today</p>
          <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden">
            <div className="bg-lime-500 h-full w-2/3" />
          </div>
          <p className="text-[10px] text-stone-500 mt-2 uppercase tracking-wider font-bold">2/3 Completed</p>
        </div>
        <Recycle className="absolute -right-4 -bottom-4 text-stone-700/30" size={120} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <QuickAction icon={Camera} label="Scan Waste" color="lime" onClick={() => onNavigate('scan')} />
        <QuickAction icon={MapPin} label="Find Center" color="blue" onClick={() => onNavigate('map')} />
        <QuickAction icon={History} label="My History" color="amber" onClick={() => {}} />
        <QuickAction icon={Info} label="Eco Tips" color="emerald" onClick={() => {}} />
      </div>

      <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Recent Scans</h4>
      <div className="space-y-3">
        <ScanItem name="Milk Carton" type="Recyclable" time="10m ago" />
        <ScanItem name="Banana Peel" type="Compostable" time="2h ago" />
        <ScanItem name="Coffee Cup" type="Trash" time="Yesterday" />
      </div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  const colors = {
    lime: "bg-lime-500/10 text-lime-500 border-lime-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all hover:scale-105 active:scale-95",
        colors[color as keyof typeof colors]
      )}
    >
      <Icon size={28} />
      <span className="text-xs font-bold text-white">{label}</span>
    </button>
  );
}

function ScanItem({ name, type, time }: { name: string, type: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/30 border border-stone-800">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        type === 'Recyclable' ? "bg-lime-500/10 text-lime-500" : 
        type === 'Compostable' ? "bg-emerald-500/10 text-emerald-500" : "bg-stone-700 text-stone-400"
      )}>
        {type === 'Recyclable' ? <Recycle size={20} /> : type === 'Compostable' ? <Leaf size={20} /> : <Trash2 size={20} />}
      </div>
      <div className="flex-1">
        <h5 className="text-sm font-bold text-white">{name}</h5>
        <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">{type} • {time}</p>
      </div>
      <ChevronRight size={16} className="text-stone-700" />
    </div>
  );
}

function ScanScreen({ onBack, onResult }: { onBack: () => void, onResult: (res: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [items] = useState(['Plastic Bottle', 'Aluminum Can', 'Newspaper', 'Glass Jar', 'Apple Core']);

  const handleScan = async (item: string) => {
    setLoading(true);
    try {
      const result = await analyzeWaste(item);
      onResult(result || '');
    } catch (e) {
      onResult('Failed to analyze item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-black relative"
    >
      {/* Camera Viewport Simulation */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 opacity-40">
          <img src="https://picsum.photos/seed/waste/800/1200" alt="Camera Feed" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        
        {/* Scanning Frame */}
        <div className="w-64 h-64 border-2 border-lime-500/50 rounded-[3rem] relative z-10 flex items-center justify-center">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-lime-500 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-lime-500 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-lime-500 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-lime-500 rounded-br-2xl" />
          
          {loading && (
            <motion.div 
              animate={{ y: [-100, 100, -100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-0.5 bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)]"
            />
          )}
        </div>

        <p className="text-white text-sm font-bold mt-8 z-10 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
          {loading ? "Analyzing with AI..." : "Align item within frame"}
        </p>
      </div>

      {/* Controls */}
      <div className="p-8 bg-stone-950 rounded-t-[3rem] border-t border-stone-800 z-20">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-3 rounded-full bg-stone-900 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button className="p-3 rounded-full bg-stone-900 text-white"><Sparkles size={20} /></button>
            <button className="p-3 rounded-full bg-stone-900 text-white"><Search size={20} /></button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {items.map(item => (
            <button 
              key={item}
              onClick={() => handleScan(item)}
              disabled={loading}
              className="whitespace-nowrap px-6 py-3 rounded-2xl bg-stone-800 text-stone-300 text-sm font-bold hover:bg-lime-500 hover:text-stone-950 transition-colors disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ResultScreen({ content, onBack }: { content: string, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-full flex flex-col bg-stone-950"
    >
      <div className="p-6 flex items-center gap-4 border-b border-stone-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-stone-900 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Analysis Result</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-lime-500/10 border border-lime-500/20 rounded-[2rem] p-6 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-500 flex items-center justify-center text-stone-950">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">+50 Eco Points</h3>
            <p className="text-xs text-lime-500 font-bold uppercase tracking-wider">Contribution Verified</p>
          </div>
        </div>

        <div className="prose prose-invert prose-stone max-w-none bg-stone-900/50 border border-stone-800 p-6 rounded-[2rem]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <button 
          onClick={onBack}
          className="w-full mt-8 bg-white text-stone-950 py-4 rounded-2xl font-bold"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}

function MapScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-stone-950"
    >
      <div className="p-6 flex items-center gap-4 border-b border-stone-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-stone-900 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Nearby Centers</h2>
      </div>
      <div className="flex-1 relative">
        <img src="https://picsum.photos/seed/map/800/1200" alt="Map" className="w-full h-full object-cover opacity-50 grayscale" referrerPolicy="no-referrer" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-lime-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Green Cycle Center</h4>
              <p className="text-[10px] text-stone-500">0.8 miles away • Open until 6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DevScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (screen: string) => {
    setLoading(true);
    try {
      const result = await generateEcoComposeCode(screen);
      setCode(result || '');
    } catch (e) {
      setCode('Error generating code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-full flex flex-col bg-stone-950"
    >
      <div className="p-6 flex items-center gap-4 border-b border-stone-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-stone-900 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Android Studio Export</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {code ? (
          <div className="space-y-4">
            <div className="prose prose-invert max-w-none text-xs bg-stone-900 p-4 rounded-2xl border border-stone-800 overflow-x-auto font-mono">
              <ReactMarkdown>{code}</ReactMarkdown>
            </div>
            <button onClick={() => setCode('')} className="w-full py-3 text-sm text-stone-500 font-bold">Back to Selection</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-400 mb-6">Select a screen to generate its Jetpack Compose code for your Android Studio project.</p>
            <button onClick={() => handleGenerate('HomeScreen')} className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 text-left flex items-center justify-between group">
              <span className="font-bold text-white">Home Screen Compose</span>
              <ChevronRight size={20} className="text-stone-700 group-hover:text-lime-500 transition-colors" />
            </button>
            <button onClick={() => handleGenerate('ScanScreen')} className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 text-left flex items-center justify-between group">
              <span className="font-bold text-white">Camera Scan View</span>
              <ChevronRight size={20} className="text-stone-700 group-hover:text-lime-500 transition-colors" />
            </button>
            <button onClick={() => handleGenerate('ResultScreen')} className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 text-left flex items-center justify-between group">
              <span className="font-bold text-white">Analysis Result UI</span>
              <ChevronRight size={20} className="text-stone-700 group-hover:text-lime-500 transition-colors" />
            </button>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-lime-500">Generating Compose Code...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
