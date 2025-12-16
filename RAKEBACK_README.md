# Rakeback MVP - Implementation Guide

## Overview

The Rakeback MVP has been implemented as a Vercel serverless application, following the same architectural pattern as the existing Achievements module. All backend logic is implemented using Vercel API routes (`/api`), and the system is designed to work immediately after deployment without any manual setup.

## Architecture

### Backend (Vercel Serverless Functions)

All API routes are located in `pages/api/`:

- **`/api/rakeback/status`** - GET - Get rakeback status for a player
- **`/api/rakeback/wager`** - POST - Record a new wager
- **`/api/rakeback/claim`** - POST - Claim accrued rakeback
- **`/api/admin/config`** - GET/POST - Get/update rakeback configuration
- **`/api/reporting/rakeback`** - GET - Get rakeback report (admin)

### Frontend (Next.js App Router)

- **Admin UI**: `/admin/rakeback` - Configure rakeback settings
- **Player UI**: `/player/rakeback` - View and claim rakeback

### Storage

Currently uses in-memory storage (ephemeral - resets on cold start). For production, replace with:
- Vercel KV (recommended)
- Database (PostgreSQL, etc.)

The storage layer is abstracted in `lib/rakeback/storage.ts` for easy replacement.

## Core Business Rules

### Formula (Fixed)

```
Rakeback = Wager Amount × House Edge × Rakeback Percentage × Override Percentage
```

- Calculations are **forward-only** (non-retroactive)
- Changes to config apply from timestamp onward
- Only **real money** wagers count (REAL_CASH, CLEARED_CASH)

### House Edge Logic

**Casino:**
- `HE = 1 - RTP`
- Uses RTP floor per category if game RTP is lower
- RTP floors are configurable per category (SLOTS, LIVE, TABLE, CRASH, OTHER)

**Sportsbook:**
- `HE = Margin`
- Global margin as fallback
- Per-sport margin floors
- Per-sport margin overrides (takes precedence)

### Eligibility

**Included:**
- `REAL_CASH`
- `CLEARED_CASH`

**Excluded:**
- `BONUS`
- `FREE_BET`
- `PROMO_BALANCE`
- Unsettled/Void sports bets

## Usage

### Admin Configuration

1. Navigate to `/admin/rakeback`
2. Configure:
   - Enable/Disable rakeback
   - Rakeback Percentage (RBP)
   - Override Percentage
   - Casino RTP floors per category
   - Sportsbook global margin
   - Sport margin floors
   - Sport margin overrides
3. Click "Save Configuration"

Changes take effect immediately for future wagers.

### Recording Wagers

**Casino Wager:**
```javascript
POST /api/rakeback/wager
{
  "playerId": "player-1",
  "amount": 1000,
  "stakeSourceType": "REAL_CASH",
  "productType": "CASINO",
  "casinoCategory": "SLOTS",
  "rtp": 0.95
}
```

**Sports Wager:**
```javascript
POST /api/rakeback/wager
{
  "playerId": "player-1",
  "amount": 500,
  "stakeSourceType": "REAL_CASH",
  "productType": "SPORTS",
  "sport": "FOOTBALL",
  "betStatus": "SETTLED"
}
```

### Player View

1. Navigate to `/player/rakeback`
2. View:
   - Total wager (casino + sports breakdown)
   - Effective house edge
   - Accrued rakeback
   - Total claimed rakeback
3. Click "Claim Rakeback" to claim accrued amount

### Reporting

**Get Rakeback Report:**
```javascript
GET /api/reporting/rakeback
```

Returns:
- Total players
- Total wager amounts
- Total accrued/claimed rakeback
- Per-player breakdown

## Calculation Example

**Scenario:**
- Player wagers $1000 on Slots (RTP: 0.95, Floor: 0.90)
- Player wagers $500 on Football (Margin: 0.10)
- RBP: 10%
- Override: 100%

**Calculation:**
1. Casino HE: `max(1 - 0.95, 1 - 0.90) = max(0.05, 0.10) = 0.10`
2. Sports HE: `0.10` (override)
3. Weighted HE: `(1000 × 0.10 + 500 × 0.10) / 1500 = 0.10`
4. Rakeback: `1500 × 0.10 × 0.10 × 1.00 = $15.00`

## Storage Upgrade (Production)

To upgrade from in-memory to persistent storage:

1. **Install Vercel KV:**
   ```bash
   npm install @vercel/kv
   ```

2. **Update `lib/rakeback/storage.ts`:**
   - Replace in-memory storage with Vercel KV calls
   - Use KV keys: `rakeback:config`, `rakeback:wagers`, etc.

3. **Set up Vercel KV:**
   - Add KV database in Vercel dashboard
   - Set environment variables

## Testing

### Manual Testing Flow

1. **Enable Rakeback:**
   - Go to `/admin/rakeback`
   - Enable rakeback, set RBP to 10%, save

2. **Create Wagers:**
   ```bash
   curl -X POST http://localhost:3000/api/rakeback/wager \
     -H "Content-Type: application/json" \
     -d '{
       "playerId": "player-1",
       "amount": 1000,
       "stakeSourceType": "REAL_CASH",
       "productType": "CASINO",
       "casinoCategory": "SLOTS",
       "rtp": 0.95
     }'
   ```

3. **Check Status:**
   ```bash
   curl http://localhost:3000/api/rakeback/status?playerId=player-1
   ```

4. **Claim Rakeback:**
   ```bash
   curl -X POST http://localhost:3000/api/rakeback/claim \
     -H "Content-Type: application/json" \
     -d '{"playerId": "player-1"}'
   ```

## Notes

- Data is **ephemeral** (resets on cold start) with current in-memory storage
- For production, upgrade to Vercel KV or database
- All calculations are **forward-only** - no retroactive recalculation
- Config changes apply from timestamp onward
- Claim resets accrued rakeback to zero

## Integration with Existing Code

The rakeback module is completely separate from the Achievements module:
- No breaking changes to existing code
- Uses same UI patterns (Tailwind, Next.js)
- Follows same architectural approach (API routes + frontend)

