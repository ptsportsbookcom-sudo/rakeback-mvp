'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface RakebackConfig {
  enabled: boolean;
  rakebackPercentage: number;
  overridePercentage: number;
  casinoRtpFloors: Record<string, number>;
  globalMargin: number;
  sportMarginFloors: Record<string, number>;
  sportMarginOverrides: Record<string, number>;
}

const CASINO_CATEGORIES = ['SLOTS', 'LIVE', 'TABLE', 'CRASH', 'OTHER'];
const SPORT_TYPES = ['FOOTBALL', 'TENNIS', 'BASKETBALL', 'ESPORTS', 'OTHER'];

export default function RakebackAdminPage() {
  const [config, setConfig] = useState<RakebackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        alert('Configuration saved successfully!');
        await loadConfig();
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const updateCasinoRtpFloor = (category: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      casinoRtpFloors: { ...config.casinoRtpFloors, [category]: value },
    });
  };

  const updateSportMarginFloor = (sport: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      sportMarginFloors: { ...config.sportMarginFloors, [sport]: value },
    });
  };

  const updateSportMarginOverride = (sport: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      sportMarginOverrides: { ...config.sportMarginOverrides, [sport]: value },
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!config) {
    return <div className="text-center py-12">Failed to load configuration</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rakeback Configuration</h2>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enable Rakeback</label>
            <p className="text-sm text-gray-500">Turn rakeback calculation on or off</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateField('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Rakeback Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rakeback Percentage (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={config.rakebackPercentage}
            onChange={(e) => updateField('rakebackPercentage', parseFloat(e.target.value))}
            className="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Override Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Override Percentage (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="200"
            value={config.overridePercentage}
            onChange={(e) => updateField('overridePercentage', parseFloat(e.target.value))}
            className="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Casino RTP Floors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Casino RTP Floors (per category)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {CASINO_CATEGORIES.map((category) => (
              <div key={category}>
                <label className="block text-xs text-gray-600 mb-1">{category}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.casinoRtpFloors[category] || 0.90}
                  onChange={(e) => updateCasinoRtpFloor(category, parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Global Margin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Global Sportsbook Margin
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={config.globalMargin}
            onChange={(e) => updateField('globalMargin', parseFloat(e.target.value))}
            className="block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Sport Margin Floors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Sport Margin Floors
          </label>
          <div className="grid grid-cols-2 gap-4">
            {SPORT_TYPES.map((sport) => (
              <div key={sport}>
                <label className="block text-xs text-gray-600 mb-1">{sport}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.sportMarginFloors[sport] || 0.08}
                  onChange={(e) => updateSportMarginFloor(sport, parseFloat(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sport Margin Overrides */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Sport Margin Overrides (optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {SPORT_TYPES.map((sport) => (
              <div key={sport}>
                <label className="block text-xs text-gray-600 mb-1">{sport}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.sportMarginOverrides[sport] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    if (value !== undefined) {
                      updateSportMarginOverride(sport, value);
                    } else {
                      const newOverrides = { ...config.sportMarginOverrides };
                      delete newOverrides[sport];
                      updateField('sportMarginOverrides', newOverrides);
                    }
                  }}
                  placeholder="Optional"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

