import { useQuery } from "@tanstack/react-query";

interface QuickStatsProps {
  sessionId: string | null;
}

interface SessionStats {
  totalConversations: number;
  totalScams: number;
  protectionRate: number;
}

export default function QuickStats({ sessionId }: QuickStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ["/api/sessions", sessionId, "stats"],
    enabled: !!sessionId,
    refetchInterval: 5000,
  }) as { data: SessionStats | undefined };

  // Default stats for display
  const displayStats = {
    totalConversations: stats?.totalConversations || 0,
    totalScams: stats?.totalScams || 0,
    protectionRate: stats?.protectionRate || 100,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Protection Stats</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Calls Monitored</span>
          <span className="text-lg font-bold text-gray-900">{displayStats.totalConversations}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Scams Detected</span>
          <span className="text-lg font-bold text-red-600">{displayStats.totalScams}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Protection Rate</span>
          <span className="text-lg font-bold text-green-600">{displayStats.protectionRate}%</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Current session</span>
            <span>Updated now</span>
          </div>
        </div>
      </div>
    </div>
  );
}