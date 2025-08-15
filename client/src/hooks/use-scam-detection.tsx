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
    if (!transcription.trim() || transcription.length < 10) {
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
      
      if (result.analysis.isScam) {
        toast({
          title: "⚠️ Potential Scam Detected!",
          description: `${result.analysis.scamType} detected with ${result.analysis.confidence}% confidence`,
          variant: "destructive",
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
