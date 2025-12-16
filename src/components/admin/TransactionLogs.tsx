import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import type { TransactionLog, Achievement } from '../../types';

export default function TransactionLogs() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [achievements, setAchievements] = useState<Record<string, Achievement>>({});

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = api.getTransactionLogs();
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    
    // Load achievement details
    const achievementMap: Record<string, Achievement> = {};
    allLogs.forEach(log => {
      if (!achievementMap[log.achievementId]) {
        const achievement = api.getAchievement(log.achievementId);
        if (achievement) {
          achievementMap[log.achievementId] = achievement;
        }
      }
    });
    setAchievements(achievementMap);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Logs</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Achievement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trigger Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vertical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RP Granted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No transaction logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const achievement = achievements[log.achievementId];
                return (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.playerId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {achievement?.title || log.achievementId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.triggerType.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.vertical.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.rewardPoints} RP
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === 'claimed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

