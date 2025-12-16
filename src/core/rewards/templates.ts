import type { BonusTemplate } from '../../types';

export const DEFAULT_BONUS_TEMPLATES: BonusTemplate[] = [
  { id: 'freebet_10', name: '€10 Free Bet', type: 'freebet', defaultAmount: 10 },
  { id: 'freespins_20', name: '20 Free Spins', type: 'freespins', defaultAmount: 20 },
  { id: 'cash_25x10', name: '€25 Cash Bonus', type: 'cash', defaultAmount: 25, defaultWagering: 10 },
];

