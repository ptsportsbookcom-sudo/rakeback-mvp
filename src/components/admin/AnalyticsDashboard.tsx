import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const data = api.getAnalytics();
    setAnalytics(data);
  };

  if (!analytics) {
    return <div className="px-4 py-6 sm:px-0">Loading analytics...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Achievements Completed</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.global.totalAchievementCompletions || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Challenges Completed</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.global.totalChallengeCompletions || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Quests Completed</h3>
          <p className="text-3xl font-bold text-indigo-600">{analytics.global.totalQuestCompletions || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total RP Granted</h3>
          <p className="text-3xl font-bold text-yellow-600">{analytics.global.totalRP}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bonuses Granted</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.global.totalBonuses}</p>
        </div>
      </div>

      {/* Bonus Analytics */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Bonus Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600">Free Bets</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.bonus.freebet}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Free Spins</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.bonus.freespins}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cash Bonuses</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.bonus.cash}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Bonuses</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.bonus.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Redemptions</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.bonus.redemptions}</p>
          </div>
        </div>
      </div>

      {/* Achievement Completions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Achievement Completions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Achievement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward Distribution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(analytics.achievements.completions || {}).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No completions yet</td>
                </tr>
              ) : (
                Object.entries(analytics.achievements.completions || {}).map(([achievementId, count]) => {
                  const achievement = api.getAchievement(achievementId);
                  const distribution = analytics.achievements.rewardDistribution[achievementId] || { points: 0, bonus: 0, both: 0 };
                  return (
                    <tr key={achievementId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {achievement?.title || achievementId.substring(0, 12)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count as number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {distribution.points > 0 && <span className="mr-2">Points: {distribution.points}</span>}
                        {distribution.bonus > 0 && <span className="mr-2">Bonus: {distribution.bonus}</span>}
                        {distribution.both > 0 && <span>Both: {distribution.both}</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challenge Completions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Challenge Completions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challenge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward Distribution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(analytics.challenges?.completions || {}).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No completions yet</td>
                </tr>
              ) : (
                Object.entries(analytics.challenges?.completions || {}).map(([challengeId, count]) => {
                  const challenge = api.getChallenge(challengeId);
                  const distribution = analytics.challenges.rewardDistribution[challengeId] || { points: 0, bonus: 0, both: 0 };
                  return (
                    <tr key={challengeId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {challenge?.title || challengeId.substring(0, 12)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count as number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {distribution.points > 0 && <span className="mr-2">Points: {distribution.points}</span>}
                        {distribution.bonus > 0 && <span className="mr-2">Bonus: {distribution.bonus}</span>}
                        {distribution.both > 0 && <span>Both: {distribution.both}</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quest Completions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quest Completions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward Distribution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(analytics.quests?.completions || {}).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No completions yet</td>
                </tr>
              ) : (
                Object.entries(analytics.quests?.completions || {}).map(([questId, count]) => {
                  const quest = api.getQuest(questId);
                  const distribution = analytics.quests.rewardDistribution[questId] || { points: 0, bonus: 0, both: 0 };
                  return (
                    <tr key={questId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quest?.title || questId.substring(0, 12)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count as number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {distribution.points > 0 && <span className="mr-2">Points: {distribution.points}</span>}
                        {distribution.bonus > 0 && <span className="mr-2">Bonus: {distribution.bonus}</span>}
                        {distribution.both > 0 && <span>Both: {distribution.both}</span>}
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



