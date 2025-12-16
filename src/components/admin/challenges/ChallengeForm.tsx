import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Challenge, TriggerType, RewardType, BonusTemplate } from '../../../types';

export default function ChallengeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    trigger: {
      type: 'login_streak',
    },
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoReset: true,
    rewardType: 'points',
    rewardPoints: 0,
    status: 'active',
    priority: 0,
  });
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);

  useEffect(() => {
    setBonusTemplates(api.getBonusTemplates());
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const challenge = api.getChallenge(id);
      if (challenge) {
        setFormData(challenge);
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      api.updateChallenge(id, formData as Challenge);
    } else {
      api.createChallenge(formData as Omit<Challenge, 'id' | 'createdAt'>);
    }
    navigate('/admin/challenges');
  };

  const updateTrigger = (updates: Partial<Challenge['trigger']>) => {
    setFormData({
      ...formData,
      trigger: { ...formData.trigger!, ...updates },
    });
  };

  const renderTriggerFields = () => {
    const trigger = formData.trigger!;
    switch (trigger.type) {
      case 'login_streak':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Days</label>
            <input
              type="number"
              value={trigger.days || ''}
              onChange={(e) => updateTrigger({ days: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        );
      case 'deposit':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Deposits</label>
            <input
              type="number"
              value={trigger.numberOfDeposits || ''}
              onChange={(e) => updateTrigger({ numberOfDeposits: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={trigger.quantity || ''}
              onChange={(e) => updateTrigger({ quantity: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Challenge' : 'Create Challenge'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trigger Type *</label>
          <select
            value={formData.trigger?.type || 'login_streak'}
            onChange={(e) => updateTrigger({ type: e.target.value as TriggerType })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="login_streak">Login Streak</option>
            <option value="game_turnover">Game Turnover</option>
            <option value="deposit">Deposit</option>
          </select>
          {renderTriggerFields()}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Frequency *</label>
          <select
            value={formData.frequency || 'daily'}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoReset"
            checked={formData.autoReset || false}
            onChange={(e) => setFormData({ ...formData, autoReset: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoReset" className="ml-2 block text-sm text-gray-900">
            Auto Reset
          </label>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Reward Configuration</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type *</label>
            <select
              value={formData.reward?.type || formData.rewardType || 'points'}
              onChange={(e) => {
                const rewardType = e.target.value as RewardType;
                setFormData({
                  ...formData,
                  rewardType,
                  reward: {
                    type: rewardType,
                    points: formData.reward?.points || formData.rewardPoints || 0,
                    bonusTemplateId: formData.reward?.bonusTemplateId,
                  },
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="points">Points Only</option>
              <option value="bonus">Bonus Only</option>
              <option value="both">Both Points & Bonus</option>
            </select>
          </div>

          {(formData.reward?.type === 'points' || formData.rewardType === 'points' || formData.reward?.type === 'both' || formData.rewardType === 'both') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Points Amount *</label>
              <input
                type="number"
                value={formData.reward?.points || formData.rewardPoints || 0}
                onChange={(e) => {
                  const points = parseInt(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    rewardPoints: points,
                    reward: formData.reward ? { ...formData.reward, points } : { type: formData.rewardType || 'points', points },
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
                min="1"
              />
            </div>
          )}

          {(formData.reward?.type === 'bonus' || formData.rewardType === 'bonus' || formData.reward?.type === 'both' || formData.rewardType === 'both') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Bonus Template *</label>
              <select
                value={formData.reward?.bonusTemplateId || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    reward: {
                      ...formData.reward!,
                      bonusTemplateId: e.target.value,
                    },
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Select Bonus Template</option>
                {bonusTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status *</label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/challenges')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

