import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Challenge } from '../../../types';

export default function ChallengesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    setChallenges(api.getChallenges());
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    api.updateChallenge(id, { status: newStatus as 'active' | 'inactive' });
    loadChallenges();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      api.deleteChallenge(id);
      loadChallenges();
    }
  };

  const formatTrigger = (trigger: Challenge['trigger']) => {
    switch (trigger.type) {
      case 'login_streak':
        return `Login Streak (${trigger.days} days)`;
      case 'game_turnover':
        return `Game Turnover (${trigger.quantity || 'N/A'} transactions)`;
      case 'deposit':
        return `Deposit (${trigger.numberOfDeposits || 'N/A'} deposits)`;
      default:
        return trigger.type;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Challenges</h2>
        <Link
          to="/admin/challenges/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Challenge
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {challenges.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No challenges found. Create your first challenge!
                </td>
              </tr>
            ) : (
              challenges.map((challenge) => (
                <tr key={challenge.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {challenge.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatTrigger(challenge.trigger)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {challenge.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        challenge.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const rewardType = challenge.reward?.type || challenge.rewardType;
                      if (rewardType === 'points') {
                        return `${challenge.reward?.points || challenge.rewardPoints || 0} RP`;
                      } else if (rewardType === 'bonus') {
                        const template = api.getBonusTemplate(challenge.reward?.bonusTemplateId || '');
                        return template ? template.name : 'Bonus';
                      } else if (rewardType === 'both') {
                        return `${challenge.reward?.points || challenge.rewardPoints || 0} RP + Bonus`;
                      }
                      return 'No Reward';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/challenges/edit/${challenge.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(challenge.id, challenge.status)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {challenge.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
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

