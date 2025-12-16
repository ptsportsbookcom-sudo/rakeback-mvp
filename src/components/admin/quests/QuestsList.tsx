import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Quest } from '../../../types';

export default function QuestsList() {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = () => {
    setQuests(api.getQuests());
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    api.updateQuest(id, { status: newStatus as 'active' | 'inactive' });
    loadQuests();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quest?')) {
      api.deleteQuest(id);
      loadQuests();
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quests</h2>
        <Link
          to="/admin/quests/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Quest
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Steps</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No quests found. Create your first quest!
                </td>
              </tr>
            ) : (
              quests.map((quest) => (
                <tr key={quest.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quest.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {quest.steps.length} step{quest.steps.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quest.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const rewardType = quest.reward?.type || quest.rewardType;
                      if (rewardType === 'points') {
                        return `${quest.reward?.points || quest.rewardPoints || 0} RP`;
                      } else if (rewardType === 'bonus') {
                        const template = api.getBonusTemplate(quest.reward?.bonusTemplateId || '');
                        return template ? template.name : 'Bonus';
                      } else if (rewardType === 'both') {
                        return `${quest.reward?.points || quest.rewardPoints || 0} RP + Bonus`;
                      }
                      return 'No Reward';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/quests/edit/${quest.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(quest.id, quest.status)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {quest.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(quest.id)}
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

