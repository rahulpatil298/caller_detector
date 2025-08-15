import { useQuery } from "@tanstack/react-query";
import type { ScamDetection } from "@shared/schema";

export default function RecentAlerts() {
  const { data: recentDetections = [] } = useQuery({
    queryKey: ["/api/scam-detections/recent"],
    refetchInterval: 10000,
  }) as { data: ScamDetection[] };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const getAlertIcon = (scamType: string) => {
    if (scamType.toLowerCase().includes("impersonation")) return "fas fa-exclamation-triangle";
    if (scamType.toLowerCase().includes("suspicious")) return "fas fa-flag";
    return "fas fa-shield-alt";
  };

  const getAlertColor = (confidence: number) => {
    if (confidence >= 80) return "red";
    if (confidence >= 50) return "yellow";
    return "green";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {recentDetections.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
              <p className="text-sm">No recent alerts</p>
              <p className="text-xs">You're protected!</p>
            </div>
          ) : (
            recentDetections.map((detection: ScamDetection, index: number) => {
              const colorType = getAlertColor(detection.confidence);
              return (
                <div key={index} className={`flex items-start space-x-3 p-3 bg-${colorType}-50 rounded-lg`}>
                  <div className="flex-shrink-0">
                    <i className={`${getAlertIcon(detection.scamType)} text-${colorType}-500 text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-${colorType}-800`}>{detection.scamType}</p>
                    <p className={`text-xs text-${colorType}-600 mt-1`}>
                      Confidence: {detection.confidence}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(detection.detectedAt.toString())}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Alerts
        </button>
      </div>
    </div>
  );
}