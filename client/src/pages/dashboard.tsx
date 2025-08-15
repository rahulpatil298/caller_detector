import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import RecordingControls from "../components/recording-controls";
import LiveTranscription from "../components/live-transcription";
import AlertBanner from "../components/alert-banner";
import QuickStats from "../components/quick-stats";
import RecentAlerts from "../components/recent-alerts";
import PrivacyNotice from "../components/privacy-notice";
import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { useScamDetection } from "../hooks/use-scam-detection";
import type { Session } from "@shared/schema";

export default function Dashboard() {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [alertData, setAlertData] = useState<any>(null);

  // Get active session
  const { data: activeSession } = useQuery({
    queryKey: ["/api/sessions/active"],
    refetchInterval: 5000,
  }) as { data: Session | undefined };

  // Speech recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  // Scam detection hook
  const { analyzeText, isAnalyzing } = useScamDetection();

  useEffect(() => {
    if (activeSession?.id) {
      setCurrentSession(activeSession.id);
    }
  }, [activeSession]);

  const handleStartRecording = async () => {
    if (!currentSession) {
      // Start new session
      try {
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const session = await response.json();
        setCurrentSession(session.id);
      } catch (error) {
        console.error("Failed to start session:", error);
        return;
      }
    }
    
    clearTranscript();
    
    // Try to start microphone, fallback gracefully if it fails
    try {
      await startListening();
    } catch (error) {
      console.error("Microphone access failed:", error);
      // Show helpful message instead of breaking the app
      console.log("Microphone access unavailable. Use the 'Test Demo' button to test fraud detection.");
    }
  };

  const handleStopRecording = async () => {
    stopListening();
    
    if (currentSession) {
      try {
        await fetch("/api/sessions/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSession }),
        });
        setCurrentSession(null);
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    }
  };

  // Analyze transcript when it changes and session is active
  useEffect(() => {
    if (transcript && currentSession && transcript.length > 20) {
      analyzeText(transcript, currentSession).then((result: any) => {
        if (result?.analysis.isScam) {
          setAlertData(result.analysis);
        }
      });
    }
  }, [transcript, currentSession, analyzeText]);

  const handleTestDemo = async () => {
    if (!currentSession) {
      // Start new session for demo
      try {
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const session = await response.json();
        setCurrentSession(session.id);
        
        // Test with demo scam conversation
        setTimeout(() => {
          testScamDetection(session.id);
        }, 500);
      } catch (error) {
        console.error("Failed to start demo session:", error);
      }
    } else {
      testScamDetection(currentSession);
    }
  };

  const testScamDetection = async (sessionId: string) => {
    const demoScamTexts = [
      // Hindi Bank Fraud
      "नमस्ते सर, मैं SBI बैंक से बोल रहा हूँ। आपके अकाउंट में संदिग्ध गतिविधि देखी गई है। आपके अकाउंट को सुरक्षित करने के लिए ₹5000 की सिक्योरिटी डिपॉज़िट चाहिए। तुरंत पेमेंट करें।",
      
      // KBC Lottery Scam
      "बधाई हो! आपने KBC लकी ड्रॉ में ₹25 लाख जीते हैं। पैसे पाने के लिए ₹2000 रजिस्ट्रेशन फीस और अपना आधार नंबर भेजें।",
      
      // OTP/CVV Theft
      "Sir, आपके डेबिट कार्ड को सुरक्षित करने के लिए OTP और CVV नंबर बताइए। यह जरूरी है।",
      
      // Tech Support Scam
      "Hello, this is John from Microsoft tech support. We detected virus on your computer. Please provide your password and download our remote access software immediately.",
      
      // Emergency Scam
      "Hello uncle, मैं आपका भतीजा हूँ। मेरा accident हो गया है। ₹50000 तुरंत भेज दीजिए।"
    ];
    
    // Pick a random scam example
    const randomScam = demoScamTexts[Math.floor(Math.random() * demoScamTexts.length)];
    
    try {
      const result = await analyzeText(randomScam, sessionId, "Suspicious Caller");
      if (result?.analysis.isScam) {
        setAlertData(result.analysis);
      }
    } catch (error) {
      console.error("Demo test failed:", error);
    }
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-white text-sm"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">ScamGuard AI</h1>
              </div>
              <span className="ml-4 px-2 py-1 bg-success-50 text-success-600 text-xs font-medium rounded-full">
                Live Protection
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                <i className="fas fa-microphone text-success-500"></i>
                Microphone Ready
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert Banner */}
        {alertData && (
          <AlertBanner 
            alertData={alertData} 
            onDismiss={() => setAlertData(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <RecordingControls
              isRecording={isListening}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isProcessing={isAnalyzing}
              onTestDemo={() => handleTestDemo()}
            />

            <LiveTranscription
              transcript={transcript}
              isListening={isListening}
              sessionId={currentSession}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickStats sessionId={currentSession} />
            <RecentAlerts />
            <PrivacyNotice />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 ScamGuard AI</span>
              <span>•</span>
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
            </div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-medium">Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
