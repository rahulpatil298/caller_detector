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

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use ScamGuard AI. Click the microphone icon in your browser's address bar.",
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      // Default to Hindi-India for better Indian language support
      recognitionRef.current.lang = 'hi-IN';
      
      // Support multiple Indian languages
      if (navigator.language.startsWith('hi')) {
        recognitionRef.current.lang = 'hi-IN';
      } else if (navigator.language.startsWith('bn')) {
        recognitionRef.current.lang = 'bn-IN';
      } else if (navigator.language.startsWith('ta')) {
        recognitionRef.current.lang = 'ta-IN';
      } else if (navigator.language.startsWith('te')) {
        recognitionRef.current.lang = 'te-IN';
      } else if (navigator.language.startsWith('mr')) {
        recognitionRef.current.lang = 'mr-IN';
      } else if (navigator.language.startsWith('gu')) {
        recognitionRef.current.lang = 'gu-IN';
      } else {
        recognitionRef.current.lang = 'en-IN';
      }

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started");
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const newText = finalTranscript + interimTranscript;
        if (newText.trim()) {
          setTranscript(prev => prev + newText);
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
          // Auto-restart when no speech detected for continuous monitoring
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (e) {
                console.log("Auto-restart failed, user needs to manually restart");
              }
            }
          }, 1500);
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
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      toast({
        title: "Failed to Start Recording",
        description: "Could not start speech recognition. Make sure your microphone is connected and try again.",
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
