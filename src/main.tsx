import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { websocketService } from "./services/websocketService";
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('🔄 New content available, please refresh.');
      // Show a prompt to user to refresh
      if (confirm('New version available! Click OK to refresh.')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('✅ App ready to work offline');
    },
    onRegistered(registration) {
      console.log('✅ Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration failed:', error);
    },
  });
}

// Initialize WebSocket service
websocketService.on('connected', () => {
  console.log('✅ WebSocket Connected - Real-time updates active');
});

websocketService.on('disconnected', () => {
  console.log('⚠️ WebSocket Disconnected - Running in simulation mode');
});

// Log application status
console.log('🚀 Campus Ride Application Starting...');
console.log('📡 WebSocket Status:', websocketService.isSocketConnected() ? 'Connected' : 'Simulation Mode');
console.log('📱 PWA Status: Enabled with offline support');

// Check if running as installed PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('📲 Running as installed PWA');
} else {
  console.log('🌐 Running in browser mode');
}

createRoot(document.getElementById("root")!).render(<App />);
