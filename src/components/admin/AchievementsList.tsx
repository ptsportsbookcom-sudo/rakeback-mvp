import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/mockApi';
import type { Achievement } from '../../types';

export default function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    setAchievements(api.getAchievements());
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    api.updateAchievement(id, { status: newStatus as 'active' | 'inactive' });
    loadAchievements();
  };

  const handleDuplicate = (achievement: Achievement) => {
    const { id, createdAt, ...rest } = achievement;
    api.createAchievement({
      ...rest,
      title: `${rest.title} (Copy)`,
    });
    loadAchievements();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      api.deleteAchievement(id);
      loadAchievements();
    }
  };

  const formatTrigger = (trigger: Achievement['trigger']) => {
    switch (trigger.type) {
      case 'login_streak':
        return `Login Streak (${trigger.days} days)`;
      case 'game_turnover':
        return `Game Turnover (${trigger.quantity || 'N/A'} transactions, min ${trigger.minimumAmount || 0})`;
      case 'game_transaction':
        return `Game Transaction (${trigger.quantity || 'N/A'} transactions)`;
      case 'deposit':
        return `Deposit (${trigger.numberOfDeposits || 'N/A'} deposits, min ${trigger.depositMinimumAmount || 0})`;
      case 'user_verification':
        return `User Verification (${trigger.verificationType})`;
      default:
        return trigger.type;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        <Link
          to="/admin/achievements/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Achievement
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trigger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vertical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {achievements.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No achievements found. Create your first achievement!
                </td>
              </tr>
            ) : (
              achievements.map((achievement) => (
                <tr key={achievement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {achievement.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {achievement.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatTrigger(achievement.trigger)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {achievement.vertical.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        achievement.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {achievement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : 'none');
                      if (rewardType === 'none') return 'No Reward';
                      const parts: string[] = [];
                      if (rewardType === 'points' || rewardType === 'both') {
                        const points = achievement.reward?.points || achievement.rewardPoints || 0;
                        if (points > 0) parts.push(`${points} RP`);
                      }
                      if (rewardType === 'bonus' || rewardType === 'both') {
                        if (achievement.reward?.bonusTemplateId) {
                          const template = api.getBonusTemplate(achievement.reward.bonusTemplateId);
                          if (template) parts.push(template.name);
                        }
                      }
                      return parts.join(' + ') || 'No Reward';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {achievement.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(achievement.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/achievements/edit/${achievement.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(achievement.id, achievement.status)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {achievement.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(achievement)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

