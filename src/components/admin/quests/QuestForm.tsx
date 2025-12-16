import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Quest, QuestStep, TriggerType, RewardType, BonusTemplate } from '../../../types';

export default function QuestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Quest>>({
    title: '',
    description: '',
    steps: [],
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
      const quest = api.getQuest(id);
      if (quest) {
        setFormData(quest);
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.steps && formData.steps.length === 0) {
      alert('Please add at least one step to the quest.');
      return;
    }
    if (isEdit && id) {
      api.updateQuest(id, formData as Quest);
    } else {
      api.createQuest(formData as Omit<Quest, 'id' | 'createdAt'>);
    }
    navigate('/admin/quests');
  };

  const addStep = () => {
    const newStep: QuestStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      trigger: { type: 'login_streak' },
      targetValue: 1,
      order: (formData.steps?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), newStep],
    });
  };

  const updateStep = (stepId: string, updates: Partial<QuestStep>) => {
    setFormData({
      ...formData,
      steps: formData.steps?.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const removeStep = (stepId: string) => {
    setFormData({
      ...formData,
      steps: formData.steps?.filter(step => step.id !== stepId).map((step, idx) => ({
        ...step,
        order: idx + 1,
      })),
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const steps = [...(formData.steps || [])];
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
      steps[index - 1].order = index;
      steps[index].order = index + 1;
    } else if (direction === 'down' && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
      steps[index].order = index + 1;
      steps[index + 1].order = index + 2;
    }
    
    setFormData({ ...formData, steps });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Quest' : 'Create Quest'}
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

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Quest Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
            >
              + Add Step
            </button>
          </div>

          {formData.steps && formData.steps.length > 0 ? (
            <div className="space-y-4">
              {formData.steps.map((step, idx) => (
                <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Step {step.order}</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, 'up')}
                        disabled={idx === 0}
                        className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, 'down')}
                        disabled={idx === formData.steps!.length - 1}
                        className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Step Title *</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trigger Type *</label>
                      <select
                        value={step.trigger.type}
                        onChange={(e) => {
                          const newType = e.target.value as TriggerType;
                          // Reset irrelevant fields when trigger type changes
                          const resetFields: Partial<QuestStep> = {};
                          if (newType !== 'deposit') {
                            resetFields.count = undefined;
                          }
                          if (newType !== 'deposit' && newType !== 'game_turnover') {
                            resetFields.amount = undefined;
                          }
                          updateStep(step.id, { 
                            trigger: { ...step.trigger, type: newType },
                            ...resetFields
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      >
                        <option value="login_streak">Login Streak</option>
                        <option value="game_turnover">Game Turnover</option>
                        <option value="deposit">Deposit</option>
                      </select>
                    </div>

                    {step.trigger.type === 'login_streak' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Days</label>
                          <input
                            type="number"
                            value={step.trigger.days || ''}
                            onChange={(e) => updateStep(step.id, { trigger: { ...step.trigger, days: parseInt(e.target.value) || 0 } })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Target Value *</label>
                          <input
                            type="number"
                            value={step.targetValue}
                            onChange={(e) => updateStep(step.id, { targetValue: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                            min="1"
                          />
                        </div>
                      </>
                    )}

                    {step.trigger.type === 'deposit' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Deposit Count (optional)</label>
                          <input
                            type="number"
                            value={step.count || ''}
                            onChange={(e) => updateStep(step.id, { count: e.target.value ? parseInt(e.target.value) || undefined : undefined })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            min="1"
                            placeholder="Number of deposits"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Deposit Amount (optional)</label>
                          <input
                            type="number"
                            value={step.amount || ''}
                            onChange={(e) => updateStep(step.id, { amount: e.target.value ? parseFloat(e.target.value) || undefined : undefined })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            min="0"
                            step="0.01"
                            placeholder="Amount in €"
                          />
                        </div>
                        {!step.count && !step.amount && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Target Value (fallback) *</label>
                            <input
                              type="number"
                              value={step.targetValue}
                              onChange={(e) => updateStep(step.id, { targetValue: parseInt(e.target.value) || 0 })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                              required
                              min="1"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {step.trigger.type === 'game_turnover' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Turnover Amount *</label>
                        <input
                          type="number"
                          value={step.amount || step.targetValue || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) || undefined : undefined;
                            updateStep(step.id, { 
                              amount: value,
                              targetValue: value ? Math.round(value) : step.targetValue // keep targetValue for backward compatibility
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          required
                          min="0"
                          step="0.01"
                          placeholder="Amount in €"
                        />
                      </div>
                    )}

                    {step.trigger.type !== 'login_streak' && step.trigger.type !== 'deposit' && step.trigger.type !== 'game_turnover' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Target Value *</label>
                        <input
                          type="number"
                          value={step.targetValue}
                          onChange={(e) => updateStep(step.id, { targetValue: parseInt(e.target.value) || 0 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          required
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No steps added yet. Click "Add Step" to create the first step.</p>
          )}
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
            onClick={() => navigate('/admin/quests')}
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

