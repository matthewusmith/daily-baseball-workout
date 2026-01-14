import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyCi01BKJBXS87lYKo5HLXrmuXC-fLMwn0M",
  authDomain: "daily-baseball-workout.firebaseapp.com",
  projectId: "daily-baseball-workout",
  storageBucket: "daily-baseball-workout.firebasestorage.app",
  messagingSenderId: "207054206442",
  appId: "1:207054206442:web:57ffc1c7fcb205113f6e93",
  measurementId: "G-FGYHXX6CRQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- CSS Styles ---
const styles = `
/* --- Color Variables & Theming --- */
:root {
  --primary: #2563eb;       
  --primary-dark: #1e40af;
  --card: #ffffff;          
  --text: #1e293b;         
  --text-muted: #64748b;   
  --accent: #eff6ff;       
  --border: #e2e8f0;
  --input-bg: #f8fafc;     
  --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  --header-text: #1e3a8a;
  --nav-height: 80px;      
  --timer-bg: #dbeafe;
  --timer-text: #1e40af;
  --timer-active-bg: #dcfce7;
  --timer-active-text: #166534;
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #60a5fa;      
    --primary-dark: #93c5fd;
    --card: #2e3b52;        
    --text: #f8fafc;        
    --text-muted: #cbd5e1;  
    --accent: #374660;      
    --border: #475569;      
    --input-bg: #40506e;    
    --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    --header-text: #f8fafc;
    --timer-bg: #1e3a8a;
    --timer-text: #bfdbfe;
    --timer-active-bg: #064e3b;
    --timer-active-text: #86efac;
  }
}

/* --- BACKGROUND IMAGE LAYER --- */
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #0f172a; 
  background-image: url('/baseball-field.jpg');
}

.app-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* UPDATED: Changed from 0.85 to 0.60 to make image MORE visible */
  background: rgba(15, 23, 42, 0.60); 
  backdrop-filter: blur(2px); 
}

/* --- SPLASH SCREEN STYLES --- */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* UPDATED: Transparent so the background image shows through */
  background: transparent; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s ease-out; /* Slower fade for smoothness */
}

.splash-content {
  text-align: center;
  animation: fadeUp 0.8s ease-out;
}

.splash-logo {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  /* Added a stronger shadow to make logo pop against the busy background */
  box-shadow: 0 20px 40px rgba(0,0,0,0.5); 
  margin-bottom: 20px;
  object-fit: cover;
  animation: pulse-logo 2s infinite ease-in-out;
}

.splash-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff; /* Pure white for readability */
  text-shadow: 0 2px 10px rgba(0,0,0,0.5); /* Shadow for text readability */
  margin: 0;
  opacity: 1;
}

@keyframes pulse-logo {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- Global Resets --- */
html { height: 100%; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: transparent; 
  color: var(--text);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  transition: color 0.3s ease;
  min-height: 100vh;
  overflow-x: hidden; 
  overscroll-behavior-y: none; 
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px var(--nav-height) 20px; 
  min-height: 100vh;
  box-sizing: border-box;
}

/* --- HEADER STYLES --- */
.app-header {
  text-align: center;
  margin-bottom: 25px;
  padding-top: calc(env(safe-area-inset-top) + 20px);
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.header-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.app-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
  object-fit: cover;
}

.app-header h1 {
  font-size: 1.6rem; 
  margin: 0;
  color: #f8fafc; 
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3); 
  line-height: 1.1;
  text-align: left; 
}

.refresh-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7); 
  font-size: 0.8rem;
  margin-top: 5px;
  cursor: pointer;
  text-decoration: underline;
  opacity: 0.7;
}

/* --- Bottom Navigation --- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(224, 242, 254, 0.6); 
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -4px 30px rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background: rgba(30, 41, 59, 0.7); 
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

@media (min-width: 600px) {
  .bottom-nav {
    left: 50%;
    transform: translateX(-50%);
    max-width: 600px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px 20px 0 0; 
  }
}

.nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
}

.nav-item.active {
  color: var(--primary);
  transform: translateY(-4px); 
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.05));
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* --- Cards --- */
.exercise-card, .static-page .exercise-card {
  background: var(--card);
  border-radius: 20px; 
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden; 
}

.exercise-card.burnout-card {
  background: linear-gradient(145deg, #0f172a 0%, #000000 100%);
  border: 2px solid #ef4444; 
  color: white;
}

.exercise-card.burnout-card h3 { color: #fca5a5; }
.exercise-card.burnout-card p { color: #e2e8f0; }
.exercise-card.burnout-card .stats-badge { background: #1e293b; border-color: #ef4444; }
.exercise-card.burnout-card .stats-badge .value { color: #ef4444; }
.exercise-card.burnout-card .stats-badge .label { color: #94a3b8; }
.exercise-card.burnout-card .cue { background: #450a0a; border-left-color: #ef4444; color: #fecaca; }

.burnout-badge {
  display: inline-block;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

/* --- Stats Grid --- */
.stats-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-badge {
  background: var(--input-bg); 
  padding: 10px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 70px;
  border: 1px solid var(--border);
}

.stat-badge .label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 800;
  margin-bottom: 2px;
}

.stat-badge.timer-container .label {
  color: var(--primary); 
}

.stat-badge .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}

/* --- TIMER COMPONENT STYLES --- */
.timer-btn {
  border: none;
  background: var(--timer-bg);
  color: var(--timer-text);
  border: 1px solid var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%; 
  text-align: left;
  padding: 0; 
  background: transparent;
  border: none;
}

.stat-badge.timer-active {
  background: var(--timer-active-bg);
  border-color: var(--timer-active-text);
  animation: pulse 2s infinite;
}

.stat-badge.timer-active .value, 
.stat-badge.timer-active .label {
  color: var(--timer-active-text) !important;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* --- Other Styles --- */
.workout-header {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--card);
  border-radius: 16px;
  border-left: 6px solid var(--primary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.workout-header h2 { margin: 0 0 5px 0; font-size: 1.5rem; color: var(--text); font-weight: 700; }
.theme-tag { margin: 0; color: var(--text-muted); font-style: italic; font-weight: 500; }
.exercise-info h3 { margin: 0 0 15px 0; font-size: 1.3rem; color: var(--text); font-weight: 700; }
.exercise-info p { color: var(--text); line-height: 1.6; }

.cue {
  background: var(--accent);
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  margin-top: 20px; 
  margin-bottom: 0;
  color: var(--text);
  border-left: 4px solid var(--primary);
  font-weight: 500;
}

.video-wrapper {
  margin-top: 15px;
  border-radius: 16px; 
  overflow: hidden;
  background: #000;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
}
.rounded-video { width: 100%; height: 100%; display: block; object-fit: cover; }
.audio-player-wrapper { background: var(--card); padding: 16px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow); }
.audio-label { margin: 0 0 10px 0; font-weight: 700; font-size: 0.95rem; color: var(--primary); display: flex; align-items: center; gap: 8px; }

.instruction-list { padding-left: 0; list-style: none; }
.instruction-list li { margin-bottom: 14px; padding-left: 28px; position: relative; font-weight: 500; }
.instruction-list li:before { content: "⚾"; position: absolute; left: 0; top: 1px; font-size: 0.9rem; }
`;

// --- NEW COMPONENT: Splash Screen ---
const SplashScreen = () => (
  <div className="splash-screen">
    <div className="splash-content">
      <img src="/icon.png" className="splash-logo" alt="Coach D Baseball" />
      <h1 className="splash-title">Coach D's<br/>Baseball Training</h1>
    </div>
  </div>
);

// --- COMPONENT: Compact Timer ---
const CompactTimer = ({ initialTimeStr }) => {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [originalDuration, setOriginalDuration] = useState(0);
  
  const startAudio = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));
  const endAudio = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'));

  useEffect(() => {
    if (!initialTimeStr) return;
    
    let totalSeconds = 0;
    const minutesMatch = initialTimeStr.match(/(\d+)\s*(m|min)/i);
    const secondsMatch = initialTimeStr.match(/(\d+)\s*(s|sec)/i);
    const colonMatch = initialTimeStr.match(/(\d+):(\d+)/); 

    if (colonMatch) {
       totalSeconds = (parseInt(colonMatch[1]) * 60) + parseInt(colonMatch[2]);
    } else {
       if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
       if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    }
    
    if (totalSeconds > 0) {
      setSecondsLeft(totalSeconds);
      setOriginalDuration(totalSeconds);
    }
  }, [initialTimeStr]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(seconds => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      endAudio.current.currentTime = 0;
      endAudio.current.play().catch(e => console.log("End audio failed", e));
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(originalDuration); 
      setIsActive(false);
    } else if (!isActive) {
      setIsActive(true);
      startAudio.current.currentTime = 0;
      startAudio.current.play().catch(e => console.error("Start audio failed", e));
      
      endAudio.current.muted = true;
      endAudio.current.play().then(() => {
        endAudio.current.pause();
        endAudio.current.currentTime = 0;
        endAudio.current.muted = false; 
      }).catch(e => console.error("Audio prime failed", e));
      
    } else {
      setIsActive(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}:${s < 10 ? '0' : ''}${s}`;
    return `${s}s`;
  };

  if (originalDuration === 0) {
    return <span className="value">{initialTimeStr}</span>;
  }

  return (
    <button 
      className="timer-btn" 
      onClick={toggleTimer}
      aria-label={isActive ? "Pause Timer" : "Start Timer"}
    >
      <span className="value">
        {isActive ? '⏳ ' : '⏱️ '}
        {formatTime(secondsLeft)}
      </span>
    </button>
  );
};

// --- Sub-Components ---
const VideoPlayer = ({ filename }) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!filename) return;
    const videoRef = ref(storage, `Videos/${filename}`);
    getDownloadURL(videoRef)
      .then((downloadUrl) => {
        setUrl(downloadUrl);
        setError(false);
      })
      .catch((err) => {
        console.error(`Error loading video ${filename}:`, err);
        setError(true);
      });
  }, [filename]);

  if (error) return <div style={{color: 'red', padding: '20px'}}>⚠️ Video missing: {filename}</div>;
  if (!url) return <div style={{color: '#94a3b8', padding: '20px'}}>Loading Video...</div>;

  return (
    <video src={url} autoPlay loop muted playsInline controls className="rounded-video" />
  );
};

const AudioPlayer = ({ filename, label = "Listen to instructions" }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!filename) return;
    const audioRef = ref(storage, `Videos/${filename}`);
    getDownloadURL(audioRef)
      .then((downloadUrl) => setUrl(downloadUrl))
      .catch((err) => console.error(`Error loading audio ${filename}:`, err));
  }, [filename]);

  if (!url) return null;

  return (
    <div className="audio-player-wrapper">
      <p className="audio-label">🔊 {label}</p>
      <audio controls src={url} style={{width: '100%'}}>Your browser does not support the audio element.</audio>
    </div>
  );
};

// --- Views ---
const HomeView = () => (
  <div className="static-page">
    <div style={{ marginBottom: '24px' }}>
      <AudioPlayer filename="home-welcome.mp3" label="Welcome Message from Coach" />
    </div>
<div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h2>Baseball Highlight Video of the Day</h2>
        <div style={{ 
          position: 'relative', 
          paddingBottom: '56.25%', /* 16:9 aspect ratio */ 
          height: 0, 
          overflow: 'hidden',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <iframe 
            src="https://www.youtube.com/embed/xNw7RHr2-Hw" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    <div className="exercise-card">
      <div className="exercise-info">
        <h3>How to use this app</h3>
        <p>Use the <strong>menu below</strong> to navigate to each day's workout.</p>
        <ul className="instruction-list">
          <li><strong>Workouts:</strong> Click Mon, Wed, or Fri for your strength & speed work.</li>
          <li><strong>Recovery:</strong> Click 'Rec' for your daily stretching routine (do this every day!).</li>
          <li><strong>Audio:</strong> Listen to Coach D's intro before starting.</li>
        </ul>
        <div style={{
          marginTop: '25px', 
          padding: '20px', 
          background: 'var(--input-bg)', 
          borderRadius: '16px',
          borderLeft: '5px solid var(--primary)',
          boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)' 
        }}>
          <h4 style={{margin: '0 0 10px 0', color: 'var(--text)', fontSize: '1.1rem'}}>⚠️ Coach's Rules</h4>
          <p style={{margin: 0, fontSize: '0.95rem', lineHeight: '1.6'}}>
            1. <strong>Quality First:</strong> Do the reps correctly, not quickly.<br/>
            2. <strong>Safety:</strong> If you feel sharp pain, STOP immediately.<br/>
            3. <strong>Clear Space:</strong> Make sure you have room to jump.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ContactView = () => (
  <div className="static-page">
    <div className="workout-header">
      <h2>Contact Coach D</h2>
      <p className="theme-tag">I'm here to help.</p>
    </div>
    <div className="exercise-card">
      <div className="exercise-info">
        <h3>Need Help?</h3>
        <p>If you have questions about the exercises, form, or if you are experiencing pain, reach out immediately.</p>
        <div className="contact-details" style={{ marginTop: '20px' }}>
          <p>📧 <strong>Email:</strong> derronda@revealbetter.com</p>
          <p>📱 <strong>Phone:</strong> (202) 768-7648</p>
          <p>🌐 <strong>Website:</strong> www.revealbetter.com</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [showSplash, setShowSplash] = useState(true);

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'monday', label: 'Mon', icon: '⚡' },
    { id: 'wednesday', label: 'Wed', icon: '💪' },
    { id: 'friday', label: 'Fri', icon: '🏃' },
    { id: 'recovery', label: 'Rec', icon: '🧘' },
    { id: 'contact', label: 'Help', icon: '✉️' }
  ];

  // 1. Hide Splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  // 2. Data Fetching
  const fetchWorkout = useCallback(async () => {
    if (activeTab === 'home' || activeTab === 'contact') {
      setWorkout(null);
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "workouts", activeTab);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWorkout(docSnap.data());
      } else {
        setWorkout(null);
      }
    } catch (error) {
      console.error("Error getting workout:", error);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchWorkout();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("App active: Refreshing data...");
        setLastUpdated(Date.now());
        fetchWorkout();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchWorkout]); 

  const handleManualRefresh = () => {
    window.location.reload(); 
  };

  return (
    <div className="container">
      <style>{styles}</style>
      
      {/* Background Layer: Always Visible */}
      <div className="app-background">
        <div className="app-background-overlay"></div>
      </div>
      
      {/* Splash Screen: Transparent so BG shows through */}
      {showSplash && <SplashScreen />}

      {/* Main UI: Wrapped in a div that is hidden while Splash is active */}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 1s ease' }}>
        <header className="app-header">
          <div className="header-title-row">
            <img src="/icon.png" className="app-logo" alt="Logo" />
            <h1>Coach D's Daily Training</h1>
          </div>
          <button onClick={handleManualRefresh} className="refresh-btn">
            Tap to Refresh App
          </button>
        </header>

        <main className="content">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'contact' && <ContactView />}
          
          {loading && <div style={{textAlign:'center', marginTop:'30px', color:'var(--text-muted)', fontWeight: '600'}}>Loading Plan...</div>}
          
          {!loading && workout && (
            <>
              <div className="workout-header">
                <h2>{workout.title}</h2>
                <p className="theme-tag">Focus: {workout.theme}</p>
                {workout.audioFilename && (
                  <div style={{ marginTop: '20px' }}>
                    <AudioPlayer filename={workout.audioFilename} label="Daily Intro & Focus" />
                  </div>
                )}
              </div>
              <div className="exercise-list">
                {workout.exercises.map((ex, index) => {
                  const isBurnout = ex.name.toLowerCase().includes('burnout');
                  const isTimer = /([0-9]+)\s*(s|sec|m|min)/i.test(ex.reps);

                  return (
                    <div key={index} className={`exercise-card ${isBurnout ? 'burnout-card' : ''}`}>
                      <div className="exercise-info">
                        {isBurnout && <span className="burnout-badge">🔥 Burnout Challenge</span>}
                        <h3>{isBurnout ? ex.name.replace(/\(Burnout\)/i, '').trim() : `${index + 1}. ${ex.name}`}</h3>
                        
                        <div className="stats-grid">
                          <div className="stat-badge">
                            <span className="label">Sets</span>
                            <span className="value">{ex.sets}</span>
                          </div>
                          
                          <div className={`stat-badge ${isTimer ? 'timer-container' : ''}`}>
                            <span className="label">
                              {isTimer ? 'Click to Start' : 'Reps'}
                            </span>
                            <CompactTimer initialTimeStr={ex.reps} />
                          </div>
                        </div>
                      </div>

                      <div className="video-wrapper">
                        <VideoPlayer filename={ex.videoFilename} />
                      </div>

                      <p className="cue">💡 <strong>Coach's Cue:</strong> {ex.cue}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>

        <nav className="bottom-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default App;