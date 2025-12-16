# Quick Start Guide

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - You'll be redirected to `/player` by default

## First Steps

### As Admin:

1. Go to `/admin` (or click "Admin Panel →" from Player UI)
2. Navigate to "Achievements" in the menu
3. Click "Create Achievement" to create your first achievement
4. Fill in the form:
   - Choose a trigger type (e.g., "Login Streak")
   - Select a vertical (e.g., "Casino")
   - Configure trigger-specific fields
   - Set reward points if desired
   - Save the achievement

### As Player:

1. Go to `/player` (default route)
2. View all active achievements in the grid
3. Use "Simulation Controls" at the bottom to test achievements:
   - Click "Simulate Login" to test login streak achievements
   - Click "Simulate Casino Bet" to test casino-related achievements
   - Click "Simulate Sports Bet" to test sportsbook achievements
   - Click "Simulate Deposit" to test deposit achievements
   - Click "Simulate Verification" to test verification achievements
4. Click on an achievement card to view details
5. When an achievement is completed, click "Claim Reward" to receive RP
6. Check your wallet at `/player/wallet` to see your Reward Points balance

## Testing Flow

1. **Create an achievement in Admin:**
   - Trigger: Login Streak
   - Days: 3
   - Vertical: Casino
   - Reward Points: 100

2. **Test in Player UI:**
   - Go to Player UI
   - Click "Simulate Login" 3 times
   - Achievement should show "Completed"
   - Click on the achievement
   - Click "Claim Reward"
   - Check wallet - should show 100 RP

3. **Verify in Admin:**
   - Go to Admin → Management
   - Check "Users Completed" tab
   - Go to Admin → Transaction Logs
   - See the transaction record

## Data Persistence

All data is stored in browser LocalStorage. To reset:
- Open browser DevTools (F12)
- Go to Application → Local Storage
- Clear all items starting with the app's storage keys

