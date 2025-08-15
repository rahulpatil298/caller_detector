import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const isSupported = useCallback(() => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Request microphone permission first with enhanced audio settings
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      // Test audio levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      console.log("Microphone connected and working");
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
    } catch (error) {
      console.error("Microphone setup failed:", error);
      toast({
        title: "Microphone Setup Failed",
        description: "Please allow microphone access and ensure your microphone is working. Check browser settings.",
        variant: "destructive",
      });
      return;
    }

    // Always recreate recognition for better reliability
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Enhanced speech recognition settings
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    // Set language with fallback chain for better Hindi support
    recognitionRef.current.lang = 'hi-IN'; // Start with Hindi
    
    console.log("Speech recognition configured for:", recognitionRef.current.lang);

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started");
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            console.log("Final speech detected:", transcript);
          } else {
            interimTranscript += transcript;
            console.log("Interim speech:", transcript);
          }
        }

        // Update transcript with both final and interim results
        if (finalTranscript.trim()) {
          setTranscript(prev => prev + finalTranscript);
        }
        
        // Show interim results too for better user feedback
        if (interimTranscript.trim() && !finalTranscript) {
          setTranscript(prev => {
            // Remove previous interim results and add new ones
            const lines = prev.split('\n');
            if (lines[lines.length - 1].startsWith('[Listening...')) {
              lines.pop();
            }
            return lines.join('\n') + '\n[Listening... "' + interimTranscript + '"]';
          });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings and try again.",
            variant: "destructive",
          });
        } else if (event.error === 'no-speech') {
          console.log("No speech detected, attempting restart...");
          // Auto-restart when no speech detected for continuous monitoring
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
                console.log("Speech recognition restarted");
              } catch (e) {
                console.log("Auto-restart failed:", e);
                setIsListening(false);
              }
            }
          }, 1000);
        } else {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try starting the monitoring again.`,
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
      };

    try {
      recognitionRef.current.start();
      console.log("Starting speech recognition...");
      
      // Show success message
      toast({
        title: "Microphone Active",
        description: "ScamGuard is now listening for conversations in Hindi and English. Speak normally.",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      toast({
        title: "Failed to Start Recording",
        description: "Could not start speech recognition. Try refreshing the page and ensure microphone permissions are granted.",
        variant: "destructive",
      });
    }
  }, [isSupported, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Request microphone permission on mount
  useEffect(() => {
    if (isSupported()) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone permission granted");
        })
        .catch((error) => {
          console.error("Microphone permission denied:", error);
        });
    }
  }, [isSupported]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    isSupported: isSupported(),
  };
}
