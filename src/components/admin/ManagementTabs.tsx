import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import type { PlayerAchievementProgress, Achievement } from '../../types';

const DEFAULT_PLAYER_ID = 'player-1';

export default function ManagementTabs() {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed'>('in_progress');
  const [progress, setProgress] = useState<PlayerAchievementProgress[]>([]);
  const [achievements, setAchievements] = useState<Record<string, Achievement>>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const allProgress = api.getPlayerAchievements(DEFAULT_PLAYER_ID);
    const filtered = activeTab === 'in_progress'
      ? allProgress.filter(p => !p.completed)
      : allProgress.filter(p => p.completed);
    
    setProgress(filtered);
    
    // Load achievement details
    const achievementMap: Record<string, Achievement> = {};
    filtered.forEach(p => {
      const achievement = api.getAchievement(p.achievementId);
      if (achievement) {
        achievementMap[p.achievementId] = achievement;
      }
    });
    setAchievements(achievementMap);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'in_progress'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users Completed
            </button>
          </nav>
        </div>

        <div className="p-6">
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
                  Progress %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progress.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No {activeTab === 'in_progress' ? 'in progress' : 'completed'} achievements found.
                  </td>
                </tr>
              ) : (
                progress.map((p) => {
                  const achievement = achievements[p.achievementId];
                  return (
                    <tr key={`${p.playerId}-${p.achievementId}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {p.playerId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {achievement?.title || p.achievementId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(p.progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(p.lastUpdate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.claimed
                              ? 'bg-green-100 text-green-800'
                              : p.completed
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.claimed ? 'Claimed' : p.completed ? 'Available' : 'In Progress'}
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
    </div>
  );
}

