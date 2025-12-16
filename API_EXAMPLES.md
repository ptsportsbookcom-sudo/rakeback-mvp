# API Examples

This document provides example API calls for testing the Rakeback MVP system.

## Base URL

- Local: `http://localhost:3000`
- Docker: `http://localhost:3000`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 1. Authentication

### Login (Admin)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Login (Player)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@test.com",
    "password": "player123"
  }'
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

## 2. Admin - Promotion Management

### Create Promotion
```bash
TOKEN="your-admin-token"

curl -X POST http://localhost:3000/admin/promotions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Rakeback 2024",
    "brandId": "brand-uuid-from-seed",
    "startAt": "2024-01-01T00:00:00.000Z",
    "endAt": "2024-12-31T23:59:59.000Z",
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
  }'
```

### List All Promotions
```bash
curl -X GET http://localhost:3000/admin/promotions \
  -H "Authorization: Bearer $TOKEN"
```

### Get Promotion Details
```bash
curl -X GET http://localhost:3000/admin/promotions/{promotion-id} \
  -H "Authorization: Bearer $TOKEN"
```

### Update Promotion
```bash
curl -X PUT http://localhost:3000/admin/promotions/{promotion-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rakebackPercentage": 12.0,
    "overridePercentage": 110.0
  }'
```

### Activate Promotion
```bash
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/activate \
  -H "Authorization: Bearer $TOKEN"
```

### End Promotion
```bash
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/end \
  -H "Authorization: Bearer $TOKEN"
```

### Generate Rakeback
```bash
curl -X POST http://localhost:3000/admin/promotions/{promotion-id}/generate-rakeback \
  -H "Authorization: Bearer $TOKEN"
```

### Get Promotion Report
```bash
curl -X GET http://localhost:3000/admin/promotions/{promotion-id}/report \
  -H "Authorization: Bearer $TOKEN"
```

## 3. Admin - Wager Management

### Create Casino Wager
```bash
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

### Create Sports Wager
```bash
curl -X POST http://localhost:3000/wagers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player-uuid",
    "promotionId": "promotion-uuid",
    "amount": 500,
    "stakeSourceType": "REAL_CASH",
    "productType": "SPORTS",
    "sport": "FOOTBALL",
    "betStatus": "SETTLED"
  }'
```

### List Wagers
```bash
# All wagers
curl -X GET http://localhost:3000/wagers \
  -H "Authorization: Bearer $TOKEN"

# Filter by user
curl -X GET "http://localhost:3000/wagers?userId=player-uuid" \
  -H "Authorization: Bearer $TOKEN"

# Filter by promotion
curl -X GET "http://localhost:3000/wagers?promotionId=promotion-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Admin - Audit Logs

### Get All Audit Logs
```bash
curl -X GET http://localhost:3000/admin/audit \
  -H "Authorization: Bearer $TOKEN"
```

### Get Audit Logs for Promotion
```bash
curl -X GET "http://localhost:3000/admin/audit?promotionId=promotion-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Player Endpoints

### Get Active Promotions
```bash
PLAYER_TOKEN="player-jwt-token"

curl -X GET http://localhost:3000/player/promotions/active \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

### Get Promotion Status
```bash
curl -X GET http://localhost:3000/player/promotions/{promotion-id}/status \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

**Response:**
```json
{
  "promotion": {
    "id": "uuid",
    "name": "Summer Rakeback 2024",
    "status": "ENDED",
    ...
  },
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

### Claim Rakeback
```bash
curl -X POST http://localhost:3000/player/promotions/{promotion-id}/claim \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

### Get Rakeback History
```bash
curl -X GET http://localhost:3000/player/promotions/history \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

## Complete Workflow Example

```bash
# 1. Login as admin
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.access_token')
BRAND_ID=$(echo $ADMIN_RESPONSE | jq -r '.user.brandId')

# 2. Create promotion
PROMO_RESPONSE=$(curl -s -X POST http://localhost:3000/admin/promotions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Promotion\",
    \"brandId\": \"$BRAND_ID\",
    \"startAt\": \"2024-01-01T00:00:00.000Z\",
    \"endAt\": \"2024-12-31T23:59:59.000Z\",
    \"rakebackPercentage\": 10.0,
    \"overridePercentage\": 100.0,
    \"globalMargin\": 0.08,
    \"casinoRtpFloors\": {\"SLOTS\": 0.90},
    \"sportMarginFloors\": {\"FOOTBALL\": 0.08}
  }")
PROMO_ID=$(echo $PROMO_RESPONSE | jq -r '.id')

# 3. Activate promotion
curl -X POST http://localhost:3000/admin/promotions/$PROMO_ID/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Login as player
PLAYER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","password":"player123"}')
PLAYER_TOKEN=$(echo $PLAYER_RESPONSE | jq -r '.access_token')
PLAYER_ID=$(echo $PLAYER_RESPONSE | jq -r '.user.id')

# 5. Create wagers (as admin)
curl -X POST http://localhost:3000/wagers \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$PLAYER_ID\",
    \"promotionId\": \"$PROMO_ID\",
    \"amount\": 1000,
    \"stakeSourceType\": \"REAL_CASH\",
    \"productType\": \"CASINO\",
    \"casinoCategory\": \"SLOTS\",
    \"rtp\": 0.95
  }"

# 6. End promotion (as admin)
curl -X POST http://localhost:3000/admin/promotions/$PROMO_ID/end \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. Generate rakeback (as admin)
curl -X POST http://localhost:3000/admin/promotions/$PROMO_ID/generate-rakeback \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 8. Check status (as player)
curl -X GET http://localhost:3000/player/promotions/$PROMO_ID/status \
  -H "Authorization: Bearer $PLAYER_TOKEN"

# 9. Claim rakeback (as player)
curl -X POST http://localhost:3000/player/promotions/$PROMO_ID/claim \
  -H "Authorization: Bearer $PLAYER_TOKEN"
```

## Notes

- Replace `{promotion-id}`, `{player-uuid}`, etc. with actual UUIDs from your database
- After seeding, you can find UUIDs using Prisma Studio: `npx prisma studio`
- All timestamps should be in ISO 8601 format
- RTP values are decimals (0.95 = 95%)
- Percentages are numbers (10.0 = 10%)

