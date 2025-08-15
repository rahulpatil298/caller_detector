interface AlertBannerProps {
  alertData: {
    scamType: string;
    analysis: string;
    confidence: number;
    patterns: string[];
  };
  onDismiss: () => void;
}

export default function AlertBanner({ alertData, onDismiss }: AlertBannerProps) {
  const handleEndCall = () => {
    // In a real implementation, this might trigger call termination
    alert("Consider ending this call immediately!");
    onDismiss();
  };

  return (
    <div className="mb-6 animate-slide-down">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-red-800 font-semibold">⚠️ Potential Scam Detected!</h3>
            <p className="text-red-700 mt-1 text-sm">
              {alertData.analysis}
            </p>
            <div className="mt-2 text-xs text-red-600">
              <strong>Scam Type:</strong> {alertData.scamType}<br />
              <strong>Confidence:</strong> {alertData.confidence}%<br />
              <strong>Detected Patterns:</strong> {alertData.patterns.join(", ")}
            </div>
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={handleEndCall}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600"
              >
                End Call
              </button>
              <button className="text-red-600 px-3 py-1 text-sm font-medium hover:text-red-800">
                View Analysis
              </button>
            </div>
          </div>
          <button 
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-red-400 hover:text-red-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
}