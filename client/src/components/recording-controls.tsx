interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isProcessing: boolean;
  onTestDemo?: () => void;
}

export default function RecordingControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  isProcessing,
  onTestDemo,
}: RecordingControlsProps) {
  const handleToggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Live Monitoring</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className={`text-sm font-medium ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
            {isRecording ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {/* Recording Button */}
      <div className="text-center mb-6">
        <button 
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <i className={`text-white text-2xl ${isRecording ? 'fas fa-stop' : 'fas fa-microphone'}`}></i>
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-75"></div>
          )}
        </button>
        <p className="mt-3 text-sm text-gray-600">
          {isRecording ? 'Recording... Click to stop' : 'Click to start monitoring'}
        </p>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <i className="fas fa-microphone-alt text-green-500 text-lg mb-2"></i>
          <p className="text-xs text-gray-600">Microphone</p>
          <p className="text-sm font-semibold text-green-600">Ready</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <i className="fas fa-language text-blue-500 text-lg mb-2"></i>
          <p className="text-xs text-gray-600">Speech-to-Text</p>
          <p className={`text-sm font-semibold ${isRecording ? 'text-blue-600' : 'text-gray-500'}`}>
            {isRecording ? 'Active' : 'Standby'}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <i className="fas fa-brain text-yellow-500 text-lg mb-2"></i>
          <p className="text-xs text-gray-600">AI Analysis</p>
          <p className={`text-sm font-semibold ${isProcessing ? 'text-yellow-600' : isRecording ? 'text-green-600' : 'text-gray-500'}`}>
            {isProcessing ? 'Processing' : isRecording ? 'Monitoring' : 'Standby'}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded text-blue-500 focus:ring-blue-500" />
            <span className="ml-2 text-gray-600">Real-time alerts</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
            <span className="ml-2 text-gray-600">Save conversations</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs">
            <option>Hindi (हिंदी)</option>
            <option>English</option>
            <option>Bengali (বাংলা)</option>
            <option>Tamil (தமிழ்)</option>
            <option>Telugu (తెలుగు)</option>
            <option>Marathi (मराठी)</option>
            <option>Gujarati (ગુજરાતી)</option>
          </select>
          <button 
            onClick={onTestDemo}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Test Demo
          </button>
        </div>
      </div>
    </div>
  );
}