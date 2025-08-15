import { useCallback, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScamAnalysisResult {
  conversation: any;
  analysis: {
    isScam: boolean;
    confidence: number;
    scamType: string;
    patterns: string[];
    analysis: string;
  };
}

export function useScamDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeText = useCallback(async (
    transcription: string,
    sessionId: string,
    speaker: string = "Caller"
  ): Promise<ScamAnalysisResult | null> => {
    if (!transcription.trim() || transcription.length < 5) {
      return null;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest("POST", "/api/conversations/analyze", {
        transcription,
        speaker,
        sessionId,
      });

      const result: ScamAnalysisResult = await response.json();
      
      if (result.analysis.isScam && result.analysis.confidence >= 60) {
        toast({
          title: "🚨 FRAUD ALERT! स्कैम अलर्ट!",
          description: `${result.analysis.scamType} detected with ${result.analysis.confidence}% confidence. Detected patterns: ${result.analysis.patterns.join(', ')}`,
          variant: "destructive",
        });
        
        // Also show browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('ScamGuard AI - FRAUD DETECTED!', {
            body: `${result.analysis.scamType} with ${result.analysis.confidence}% confidence`,
            icon: '/favicon.ico'
          });
        }
      } else if (result.analysis.isScam && result.analysis.confidence >= 30) {
        toast({
          title: "⚠️ Suspicious Activity Detected",
          description: `Possible ${result.analysis.scamType} (${result.analysis.confidence}% confidence)`,
          variant: "default",
        });
      }

      return result;
    } catch (error) {
      console.error("Failed to analyze text:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the conversation for scam patterns.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  return {
    analyzeText,
    isAnalyzing,
  };
}
