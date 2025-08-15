import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@shared/schema";

interface LiveTranscriptionProps {
  transcript: string;
  isListening: boolean;
  sessionId: string | null;
}

export default function LiveTranscription({ transcript, isListening, sessionId }: LiveTranscriptionProps) {
  const transcriptionRef = useRef<HTMLDivElement>(null);

  // Get conversations for current session
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", sessionId],
    enabled: !!sessionId,
    refetchInterval: 2000,
  }) as { data: Conversation[] };

  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [conversations, transcript]);

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderTranscriptionEntries = () => {
    if (!isListening && conversations.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <i className="fas fa-microphone-slash text-2xl mb-2"></i>
            <p className="text-sm">Start monitoring to see live transcription</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conversations.map((conv: Conversation, index: number) => (
          <div key={index} className="flex space-x-3 animate-slide-up">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${conv.speaker === 'You' ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                <span className={`text-xs font-medium ${conv.speaker === 'You' ? 'text-green-600' : 'text-blue-600'}`}>
                  {conv.speaker.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{conv.speaker}</span>
                <span className="text-xs text-gray-500">{formatTime(conv.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-700">{conv.transcription}</p>
            </div>
            <div className="flex-shrink-0">
              {conv.isScam && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  <i className="fas fa-exclamation-triangle w-3 h-3 mr-1"></i>
                  Suspicious
                </span>
              )}
            </div>
          </div>
        ))}
        
        {isListening && transcript && (
          <div className="flex space-x-3 opacity-70">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">L</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">Live</span>
                <span className="text-xs text-gray-500">{formatTime(new Date())}</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-700">{transcript}</p>
            </div>
          </div>
        )}
        
        {isListening && !transcript && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Transcription</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <button className="text-gray-400 hover:text-gray-600 text-sm">
              <i className="fas fa-expand-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div 
          ref={transcriptionRef}
          className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-4"
        >
          {renderTranscriptionEntries()}
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>Confidence: <span className="font-medium">95%</span></span>
          <span>Processing delay: <span className="font-medium">0.2s</span></span>
        </div>
      </div>
    </div>
  );
}