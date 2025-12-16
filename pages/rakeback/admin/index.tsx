import { useState, useEffect } from 'react';
import type { RakebackConfig } from '../../../lib/rakeback/types';

const CASINO_CATEGORIES = ['SLOTS', 'LIVE', 'TABLE', 'CRASH', 'OTHER'] as const;
const SPORT_TYPES = ['FOOTBALL', 'TENNIS', 'BASKETBALL', 'ESPORTS', 'OTHER'] as const;

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
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
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

  const updateField = (field: keyof RakebackConfig, value: any) => {
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

  const updateSportMarginOverride = (sport: string, value: number | undefined) => {
    if (!config) return;
    if (value !== undefined) {
      setConfig({
        ...config,
        sportMarginOverrides: { ...config.sportMarginOverrides, [sport]: value },
      });
    } else {
      const newOverrides = { ...config.sportMarginOverrides };
      delete newOverrides[sport as keyof typeof newOverrides];
      setConfig({
        ...config,
        sportMarginOverrides: newOverrides,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">Failed to load configuration</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rakeback Configuration</h1>
          <p className="mt-2 text-sm text-gray-600">Configure rakeback calculation settings</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enable Rakeback</label>
              <p className="text-sm text-gray-500 mt-1">Turn rakeback calculation on or off</p>
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
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Casino RTP Floors */}
          <div className="border-t pt-4">
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
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Global Margin */}
          <div className="border-t pt-4">
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
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sport Margin Floors */}
          <div className="border-t pt-4">
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
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sport Margin Overrides */}
          <div className="border-t pt-4">
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
                      updateSportMarginOverride(sport, value);
                    }}
                    placeholder="Optional"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

