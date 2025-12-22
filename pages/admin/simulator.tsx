import { useState, useEffect } from 'react';
import { ProductType, StakeSourceType, CasinoCategory, SportType, BetStatus } from '../../lib/rakeback/types';
import type { RakebackConfig } from '../../lib/rakeback/types';
import { calculateCasinoHouseEdge, calculateSportsEffectiveMargin } from '../../lib/rakeback/calculator';

export default function SimulatorPage() {
  const [playerId, setPlayerId] = useState('player1');
  const [productType, setProductType] = useState<ProductType>(ProductType.CASINO);
  const [amount, setAmount] = useState('100');
  const [stakeSourceType, setStakeSourceType] = useState<StakeSourceType>(StakeSourceType.REAL_CASH);
  
  // Casino fields
  const [casinoCategory, setCasinoCategory] = useState<CasinoCategory>(CasinoCategory.SLOTS);
  const [rtp, setRtp] = useState('95');
  
  // Sports fields
  const [sport, setSport] = useState<SportType>(SportType.FOOTBALL);
  const [margin, setMargin] = useState('0.08');
  
  const [loading, setLoading] = useState(false);
  const [lastWager, setLastWager] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<RakebackConfig | null>(null);

  // Load config for preview
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };
    loadConfig();
  }, []);

  // Calculate preview values
  const calculatePreview = () => {
    if (!config || !amount || parseFloat(amount) <= 0) {
      return null;
    }

    const wagerAmount = parseFloat(amount);
    let effectiveEdge = 0;

    if (productType === ProductType.CASINO) {
      const rtpDecimal = parseFloat(rtp) / 100;
      effectiveEdge = calculateCasinoHouseEdge(rtpDecimal, casinoCategory, config.casinoRtpFloors);
    } else {
      const marginDecimal = parseFloat(margin);
      effectiveEdge = calculateSportsEffectiveMargin(marginDecimal, sport, config.sportMarginFloors);
    }

    const baseRakebackPct = config.rakebackPercentage / 100;
    const overrideMultiplier = config.overridePercentage / 100;
    const expectedRakeback = wagerAmount * effectiveEdge * baseRakebackPct * overrideMultiplier;

    return {
      effectiveEdge,
      baseRakebackPct: config.rakebackPercentage,
      overridePct: config.overridePercentage,
      expectedRakeback,
    };
  };

  const preview = calculatePreview();

  const handlePlaceBet = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        playerId,
        amount: parseFloat(amount),
        stakeSourceType,
        productType,
      };

      if (productType === ProductType.CASINO) {
        payload.casinoCategory = casinoCategory;
        payload.rtp = parseFloat(rtp) / 100; // Convert percentage to decimal
      } else {
        payload.sport = sport;
        payload.margin = parseFloat(margin);
        payload.betStatus = BetStatus.SETTLED;
      }

      const response = await fetch('/api/rakeback/wager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setLastWager(data.wager);
        // Clear form
        setAmount('100');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to place wager');
      }
    } catch (error) {
      console.error('Failed to place wager:', error);
      setError('Failed to place wager');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRandom = async () => {
    setLoading(true);
    setError(null);
    try {
      const categories = Object.values(CasinoCategory);
      const sports = Object.values(SportType);
      const amounts = [50, 100, 150, 200, 250, 300];
      const rtps = [92, 93, 94, 95, 96, 97];
      const margins = [0.06, 0.07, 0.08, 0.09, 0.10];

      for (let i = 0; i < 20; i++) {
        const isCasino = Math.random() > 0.5;
        const payload: any = {
          playerId,
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          stakeSourceType: StakeSourceType.REAL_CASH,
          productType: isCasino ? ProductType.CASINO : ProductType.SPORTS,
        };

        if (isCasino) {
          payload.casinoCategory = categories[Math.floor(Math.random() * categories.length)];
          payload.rtp = rtps[Math.floor(Math.random() * rtps.length)] / 100;
        } else {
          payload.sport = sports[Math.floor(Math.random() * sports.length)];
          payload.margin = margins[Math.floor(Math.random() * margins.length)];
          payload.betStatus = BetStatus.SETTLED;
        }

        const response = await fetch('/api/rakeback/wager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(`Failed to place wager ${i + 1}: ${errorData.error}`);
          break;
        }
      }

      if (!error) {
        alert('Generated 20 random wagers successfully!');
      }
    } catch (error) {
      console.error('Failed to generate wagers:', error);
      setError('Failed to generate wagers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bet Simulator</h1>
          <p className="mt-2 text-sm text-gray-600">Simulate wagers to test rakeback calculation</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Player ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player ID
            </label>
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as ProductType)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={ProductType.CASINO}>Casino</option>
              <option value={ProductType.SPORTS}>Sportsbook</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wager Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Stake Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stake Source
            </label>
            <select
              value={stakeSourceType}
              onChange={(e) => setStakeSourceType(e.target.value as StakeSourceType)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={StakeSourceType.REAL_CASH}>Real Cash (eligible)</option>
              <option value={StakeSourceType.CLEARED_CASH}>Cleared Cash (eligible)</option>
              <option value={StakeSourceType.BONUS}>Bonus (excluded)</option>
              <option value={StakeSourceType.FREE_BET}>Free Bet (excluded)</option>
              <option value={StakeSourceType.PROMO_BALANCE}>Promo Balance (excluded)</option>
            </select>
          </div>

          {/* Casino-specific fields */}
          {productType === ProductType.CASINO && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Casino Category
                </label>
                <select
                  value={casinoCategory}
                  onChange={(e) => setCasinoCategory(e.target.value as CasinoCategory)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(CasinoCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reported RTP (0-100, e.g., 95 = 95%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={rtp}
                  onChange={(e) => setRtp(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* Sports-specific fields */}
          {productType === ProductType.SPORTS && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as SportType)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(SportType).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reported Margin (0-1, e.g., 0.08 = 8%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Live Preview */}
          {preview && config && config.enabled && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Live Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Effective {productType === ProductType.CASINO ? 'Edge' : 'Margin'}:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {(preview.effectiveEdge * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Base Rakeback %:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {preview.baseRakebackPct.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Override %:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {preview.overridePct.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Expected Rakeback:</span>
                  <span className="ml-2 font-semibold text-blue-900">
                    ${preview.expectedRakeback.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-600">
                Formula: ${parseFloat(amount).toFixed(2)} × {(preview.effectiveEdge * 100).toFixed(2)}% × {preview.baseRakebackPct.toFixed(1)}% × {preview.overridePct.toFixed(1)}% = ${preview.expectedRakeback.toFixed(2)}
              </div>
            </div>
          )}

          {config && !config.enabled && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">Rakeback is currently disabled. Enable it in the config page to see preview.</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handlePlaceBet}
            disabled={loading}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Placing Bet...' : 'Simulate Bet'}
          </button>

          {/* Generate Random Button */}
          <button
            onClick={handleGenerateRandom}
            disabled={loading}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Generate 20 Random Wagers'}
          </button>

          {/* Last Wager Result */}
          {lastWager && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-sm font-medium text-green-900 mb-2">Wager Result</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Wager ID:</strong> {lastWager.id}</p>
                <p><strong>Amount:</strong> ${lastWager.amount.toFixed(2)}</p>
                {lastWager.effectiveHouseEdge !== undefined && (
                  <p><strong>Effective House Edge:</strong> {(lastWager.effectiveHouseEdge * 100).toFixed(2)}%</p>
                )}
                {lastWager.rakebackEarned !== undefined && (
                  <p className="font-semibold"><strong>Rakeback Generated:</strong> ${lastWager.rakebackEarned.toFixed(2)}</p>
                )}
                <p className="mt-2 text-xs text-green-700">
                  Rakeback has been accrued. Check Player Rakeback page to see updated totals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
