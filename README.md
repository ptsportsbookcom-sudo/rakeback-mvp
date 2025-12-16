# Rakeback MVP - Long-Term Cashback System

A fully functional MVP for a Long-Term Cashback system (Phase 1: Rakeback only) for an iGaming platform (Casino + Sportsbook).

## Tech Stack

- **Backend**: Node.js + NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Auth**: JWT (Admin + Player roles)
- **Infrastructure**: Docker Compose

## Features

### ✅ Included

- Rakeback engine based on wager
- Casino House Edge floors
- Sportsbook margin floors
- Per-sport overrides
- Manual claim
- Back Office UI
- Player UI
- API for external FE
- Reporting
- Audit logging

### ❌ Excluded (Not Implemented)

- Loss Cashback
- Combined Mode
- APCP / MCAP
- Instant Cashback
- Tier systems
- Bonus wagering
- Simulation UI

## Formula

**Rakeback = Wager × House Edge × Rakeback Percentage × Override Percentage**

- Apply forward only (non-retroactive)
- Override % and RBP can be changed during promo
- Changes apply from timestamp onward

## Eligibility Rules

Only **REAL MONEY** wagering is included:

**Eligible:**
- `REAL_CASH`
- `CLEARED_CASH`

**Excluded:**
- `BONUS`
- `FREE_BET`
- `PROMO_BALANCE`

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Quick Start with Docker

1. **Clone and navigate to the project directory**

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec api npx prisma migrate dev --name init
   ```

4. **Seed the database:**
   ```bash
   docker-compose exec api npm run prisma:seed
   ```

5. **Access the applications:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432

### Local Development Setup

#### Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed database:**
   ```bash
   npm run prisma:seed
   ```

7. **Start development server:**
   ```bash
   npm run start:dev
   ```

#### Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Test Credentials

After seeding, you can use these credentials:

- **Admin**: `admin@test.com` / `admin123`
- **Player 1**: `player1@test.com` / `player123`
- **Player 2**: `player2@test.com` / `player123`

## API Endpoints

### Authentication

#### POST /auth/login
Login and get JWT token.

**Request:**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@test.com",
    "role": "ADMIN",
    "brandId": "uuid"
  }
}
```

### Admin Endpoints

All admin endpoints require JWT authentication with `ADMIN` role.

#### POST /admin/promotions
Create a new promotion.

**Request:**
```json
{
  "name": "Summer Rakeback",
  "brandId": "brand-uuid",
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z",
  "rakebackPercentage": 10.0,
  "overridePercentage": 100.0,
  "globalMargin": 0.08,
  "casinoRtpFloors": {
    "SLOTS": 0.90,
    "LIVE": 0.95,
    "TABLE": 0.92,
    "CRASH": 0.88,
    "OTHER": 0.90
  },
  "sportMarginFloors": {
    "FOOTBALL": 0.08,
    "TENNIS": 0.10,
    "BASKETBALL": 0.09,
    "ESPORTS": 0.12,
    "OTHER": 0.08
  },
  "sportMarginOverrides": {
    "FOOTBALL": 0.10
  }
}
```

#### PUT /admin/promotions/:id
Update a promotion.

#### POST /admin/promotions/:id/activate
Activate a draft promotion.

#### POST /admin/promotions/:id/end
End an active promotion.

#### POST /admin/promotions/:id/generate-rakeback
Generate rakeback snapshots for an ended promotion.

#### GET /admin/promotions/:id/report
Get promotion report with rakeback summary.

**Response:**
```json
{
  "promotion": { ... },
  "summary": {
    "totalPlayers": 2,
    "totalWager": 5000,
    "totalCasinoWager": 3000,
    "totalSportsWager": 2000,
    "totalRakeback": 450.50,
    "claimedCount": 1,
    "unclaimedCount": 1
  },
  "rakebacks": [ ... ]
}
```

#### GET /admin/promotions
List all promotions.

#### GET /admin/audit
Get audit logs (optionally filtered by `?promotionId=uuid`).

### Player Endpoints

All player endpoints require JWT authentication.

#### GET /player/promotions/active
Get active promotions for the player.

#### GET /player/promotions/:id/status
Get rakeback status for a promotion.

**Response:**
```json
{
  "promotion": { ... },
  "rakeback": {
    "id": "uuid",
    "totalWager": 2500,
    "casinoWager": 1500,
    "sportsWager": 1000,
    "effectiveHouseEdge": 0.095,
    "rakebackAmount": 237.50,
    "claimed": false
  },
  "summary": {
    "totalWager": 2500,
    "casinoWager": 1500,
    "sportsWager": 1000
  }
}
```

#### POST /player/promotions/:id/claim
Claim rakeback for an ended promotion.

#### GET /player/promotions/:id/history
Get rakeback history for the player.

### Wager Endpoints (Admin)

#### POST /wagers
Create a wager (for testing).

**Request:**
```json
{
  "userId": "player-uuid",
  "promotionId": "promotion-uuid",
  "amount": 1000,
  "stakeSourceType": "REAL_CASH",
  "productType": "CASINO",
  "casinoCategory": "SLOTS",
  "rtp": 0.95
}
```

**Sports wager example:**
```json
{
  "userId": "player-uuid",
  "promotionId": "promotion-uuid",
  "amount": 500,
  "stakeSourceType": "REAL_CASH",
  "productType": "SPORTS",
  "sport": "FOOTBALL",
  "betStatus": "SETTLED"
}
```

## Example Workflow

### 1. Create and Activate Promotion (Admin)

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Save the token
TOKEN="your-jwt-token"

# Create promotion
curl -X POST http://localhost:3000/admin/promotions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Promotion",
    "brandId": "brand-uuid-from-seed",
    "startAt": "2024-01-01T00:00:00Z",
    "endAt": "2024-12-31T23:59:59Z",
    "rakebackPercentage": 10.0,
    "overridePercentage": 100.0,
    "globalMargin": 0.08,
    "casinoRtpFloors": {"SLOTS": 0.90},
    "sportMarginFloors": {"FOOTBALL": 0.08}
  }'

# Activate promotion
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/activate \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Create Wagers (Admin)

```bash
# Create casino wager
curl -X POST http://localhost:3000/wagers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player-uuid",
    "promotionId": "promotion-uuid",
    "amount": 1000,
    "stakeSourceType": "REAL_CASH",
    "productType": "CASINO",
    "casinoCategory": "SLOTS",
    "rtp": 0.95
  }'
```

### 3. End Promotion and Generate Rakeback (Admin)

```bash
# End promotion
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/end \
  -H "Authorization: Bearer $TOKEN"

# Generate rakeback
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/generate-rakeback \
  -H "Authorization: Bearer $TOKEN"

# View report
curl -X GET http://localhost:3000/admin/promotions/{promotion-id}/report \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Claim Rakeback (Player)

```bash
# Login as player
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","password":"player123"}'

# Save player token
PLAYER_TOKEN="player-jwt-token"

# Check status
curl -X GET http://localhost:3000/player/promotions/{promotion-id}/status \
  -H "Authorization: Bearer $PLAYER_TOKEN"

# Claim rakeback
curl -X POST http://localhost:3000/player/promotions/{promotion-id}/claim \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

## Calculation Logic

### Casino House Edge

```
Real_HE = 1 - RTP
Floor_HE = 1 - RTP_FLOOR
Effective_HE = max(Real_HE, Floor_HE)
```

### Sportsbook House Edge

```
Effective_HE = max(GlobalMargin, SportFloor, SportOverride)
```

### Weighted Calculation

```
Σ(wager × effectiveHE)
---------------------- × RBP × Override
Σ(wager)
```

Final rakeback amount is rounded to 2 decimals.

## Database Schema

Key models:
- `User` - Admin and Player users
- `Brand` - Brand/organization
- `Promotion` - Rakeback promotion configuration
- `Wager` - Individual wagers (casino or sports)
- `Rakeback` - Calculated rakeback snapshots
- `WalletTransaction` - Wallet credits from claims
- `AuditLog` - Audit trail of all admin changes

## Development

### Running Tests

```bash
cd backend
npm test
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Studio

```bash
cd backend
npx prisma studio
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/          # JWT authentication
│   │   ├── promotions/    # Promotion management
│   │   ├── rakeback/      # Rakeback calculation
│   │   ├── wagers/        # Wager management
│   │   ├── audit/         # Audit logging
│   │   └── prisma/        # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed script
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── admin/         # Admin UI
│   │   ├── player/        # Player UI
│   │   └── login/         # Login page
│   └── package.json
└── docker-compose.yml
```

## Notes

- All rakeback calculations are forward-only (non-retroactive)
- Changes to RBP or Override % apply from timestamp onward
- Only SETTLED sports bets are included in calculations
- Bonus wagers are automatically excluded
- Claim is idempotent (safe to call multiple times)

## License

MIT
