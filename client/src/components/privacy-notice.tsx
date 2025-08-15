export default function PrivacyNotice() {
  return (
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <i className="fas fa-shield-alt text-blue-500"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900">Privacy Protected</h4>
          <p className="text-xs text-blue-700 mt-1">
            All processing happens locally. Your conversations are never stored or transmitted without permission.
          </p>
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2">
            Learn more about privacy →
          </button>
        </div>
      </div>
    </div>
  );
}