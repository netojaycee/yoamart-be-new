# Supermarket Expiry Tracking System - API Documentation

## Overview
Complete API specification for the Expiry Tracking feature. All endpoints require admin authentication via JWT Bearer token.

---

## Authentication
All endpoints (except `/alert-rule/default`) require:
```
Authorization: Bearer {JWT_TOKEN}
```

User must have `role: "admin"` to access these endpoints.

---

## API Endpoints

### 1. BATCH ENDPOINTS

#### 1.1 Create Batch
**POST** `/api/batch/create`

Create a new batch for tracking inventory by expiry date.

**Request:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "expiryDate": "2026-03-31",
  "productionDate": "2025-12-15",
  "quantityTotal": 100
}
```

**Response (200):**
```json
{
  "batch": {
    "_id": "507f1f77bcf86cd799439012",
    "productId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Coca Cola 500ml",
      "price": 2.50
    },
    "expiryDate": "2026-03-31T00:00:00.000Z",
    "productionDate": "2025-12-15T00:00:00.000Z",
    "quantityTotal": 100,
    "quantityAvailable": 100,
    "status": "ACTIVE",
    "createdAt": "2026-02-25T10:30:00.000Z",
    "updatedAt": "2026-02-25T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: Product not found
- 400: Invalid expiry date

---

#### 1.2 Get All Batches
**GET** `/api/batch?page=1&limit=10&status=ACTIVE&productId=507f1f77bcf86cd799439011`

Retrieve paginated list of batches with optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (ACTIVE, NEAR_EXPIRY, EXPIRED, REMOVED, DISPOSED_RETURNED)
- `productId` (optional): Filter by product ID

**Response (200):**
```json
{
  "batches": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "productId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Coca Cola 500ml"
      },
      "expiryDate": "2026-03-31T00:00:00.000Z",
      "quantityTotal": 100,
      "quantityAvailable": 100,
      "status": "ACTIVE"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

---

#### 1.3 Get Batch by ID
**GET** `/api/batch/:batchId`

Retrieve detailed information for a specific batch.

**Response (200):**
```json
{
  "batch": {
    "_id": "507f1f77bcf86cd799439012",
    "productId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Coca Cola 500ml",
      "price": 2.50,
      "category": "Beverages"
    },
    "expiryDate": "2026-03-31T00:00:00.000Z",
    "productionDate": "2025-12-15T00:00:00.000Z",
    "quantityTotal": 100,
    "quantityAvailable": 100,
    "status": "ACTIVE",
    "createdAt": "2026-02-25T10:30:00.000Z",
    "updatedAt": "2026-02-25T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid batch ID format
- 400: Batch not found

---

#### 1.4 Update Batch Quantity
**PATCH** `/api/batch/:batchId/quantity`

Update the available quantity of a batch.

**Request:**
```json
{
  "quantityAvailable": 85
}
```

**Response (200):**
```json
{
  "batch": {
    "_id": "507f1f77bcf86cd799439012",
    "quantityAvailable": 85,
    "status": "ACTIVE"
  }
}
```

**Errors:**
- 400: Invalid batch ID
- 400: Quantity cannot be negative

---

#### 1.5 Get Batches by Status
**GET** `/api/batch/status/:status`

Get all batches with a specific status, sorted by expiry date.

**Valid Status Values:**
- ACTIVE
- NEAR_EXPIRY
- EXPIRED
- REMOVED
- DISPOSED_RETURNED

**Response (200):**
```json
{
  "batches": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "productId": { "name": "Coca Cola 500ml" },
      "expiryDate": "2026-03-15T00:00:00.000Z",
      "quantityAvailable": 100,
      "status": "NEAR_EXPIRY"
    }
  ],
  "count": 5
}
```

---

### 2. ALERT ENDPOINTS

#### 2.1 Get All Alerts
**GET** `/api/alert?acknowledged=false&page=1&limit=10`

Retrieve paginated list of alerts.

**Query Parameters:**
- `acknowledged` (optional): "true" or "false" to filter by acknowledgment status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "batchId": {
        "_id": "507f1f77bcf86cd799439012",
        "productId": {
          "name": "Coca Cola 500ml"
        },
        "expiryDate": "2026-03-15T00:00:00.000Z",
        "quantityAvailable": 100
      },
      "ruleId": {
        "_id": "507f1f77bcf86cd799439014",
        "ruleName": "Default",
        "daysBeforeExpiry": 3
      },
      "alertType": "NEAR_EXPIRY",
      "alertDate": "2026-03-12T10:30:00.000Z",
      "acknowledged": false,
      "acknowledgedAt": null,
      "acknowledgedBy": null,
      "createdAt": "2026-03-12T10:30:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

---

#### 2.2 Get Open Alerts (Unacknowledged)
**GET** `/api/alert/open`

Get all unacknowledged alerts, sorted by recency.

**Response (200):**
```json
{
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "batchId": {
        "productId": { "name": "Coca Cola 500ml" },
        "expiryDate": "2026-03-15T00:00:00.000Z",
        "quantityAvailable": 100
      },
      "alertType": "NEAR_EXPIRY",
      "alertDate": "2026-03-12T10:30:00.000Z",
      "acknowledged": false
    }
  ],
  "count": 3
}
```

---

#### 2.3 Get Alert by ID
**GET** `/api/alert/:alertId`

Retrieve details of a specific alert.

**Response (200):**
```json
{
  "alert": {
    "_id": "507f1f77bcf86cd799439013",
    "batchId": {
      "_id": "507f1f77bcf86cd799439012",
      "productId": {
        "name": "Coca Cola 500ml",
        "price": 2.50
      },
      "expiryDate": "2026-03-15T00:00:00.000Z",
      "quantityAvailable": 100,
      "status": "NEAR_EXPIRY"
    },
    "ruleId": {
      "_id": "507f1f77bcf86cd799439014",
      "ruleName": "Default",
      "daysBeforeExpiry": 3
    },
    "alertType": "NEAR_EXPIRY",
    "alertDate": "2026-03-12T10:30:00.000Z",
    "acknowledged": false
  }
}
```

---

#### 2.4 Acknowledge Alert
**PATCH** `/api/alert/:alertId/acknowledge`

Mark an alert as acknowledged by staff.

**Request:**
```json
{
  "acknowledgedBy": "John Doe"
}
```

**Response (200):**
```json
{
  "message": "Alert acknowledged successfully!",
  "alert": {
    "_id": "507f1f77bcf86cd799439013",
    "acknowledged": true,
    "acknowledgedAt": "2026-03-12T14:30:00.000Z",
    "acknowledgedBy": "John Doe"
  }
}
```

**Errors:**
- 400: Invalid alert ID
- 400: Staff name (acknowledgedBy) required

---

#### 2.5 Get Alerts by Batch
**GET** `/api/alert/batch/:batchId`

Get all alerts for a specific batch.

**Response (200):**
```json
{
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "alertType": "NEAR_EXPIRY",
      "alertDate": "2026-03-12T10:30:00.000Z",
      "acknowledged": false
    }
  ],
  "count": 1
}
```

---

### 3. ALERT RULE ENDPOINTS

#### 3.1 Create Alert Rule
**POST** `/api/alert-rule/create`

Create a new alert rule for triggering notifications.

**Request:**
```json
{
  "ruleName": "3 Days Before",
  "daysBeforeExpiry": 3,
  "active": true
}
```

**Response (200):**
```json
{
  "rule": {
    "_id": "507f1f77bcf86cd799439014",
    "ruleName": "3 Days Before",
    "daysBeforeExpiry": 3,
    "active": true,
    "createdAt": "2026-02-25T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: ruleName and daysBeforeExpiry required
- 400: daysBeforeExpiry must be positive
- 400: Rule with this name already exists

---

#### 3.2 Get All Alert Rules
**GET** `/api/alert-rule?active=true`

Retrieve all alert rules with optional filtering.

**Query Parameters:**
- `active` (optional): "true" or "false" to filter by active status

**Response (200):**
```json
{
  "rules": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "ruleName": "3 Days Before",
      "daysBeforeExpiry": 3,
      "active": true,
      "createdAt": "2026-02-25T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 3.3 Get Default Alert Rule
**GET** `/api/alert-rule/default`

Get the first active rule. Creates a default if none exists.

**Response (200):**
```json
{
  "rule": {
    "_id": "507f1f77bcf86cd799439014",
    "ruleName": "Default",
    "daysBeforeExpiry": 3,
    "active": true
  }
}
```

---

#### 3.4 Get Alert Rule by ID
**GET** `/api/alert-rule/:ruleId`

Retrieve specific alert rule details.

**Response (200):**
```json
{
  "rule": {
    "_id": "507f1f77bcf86cd799439014",
    "ruleName": "3 Days Before",
    "daysBeforeExpiry": 3,
    "active": true
  }
}
```

---

#### 3.5 Update Alert Rule
**PATCH** `/api/alert-rule/:ruleId`

Update an existing alert rule.

**Request:**
```json
{
  "ruleName": "3 Days Before (Updated)",
  "daysBeforeExpiry": 5,
  "active": true
}
```

**Response (200):**
```json
{
  "rule": {
    "_id": "507f1f77bcf86cd799439014",
    "ruleName": "3 Days Before (Updated)",
    "daysBeforeExpiry": 5,
    "active": true
  }
}
```

---

#### 3.6 Delete Alert Rule
**DELETE** `/api/alert-rule/:ruleId`

Delete an alert rule.

**Response (200):**
```json
{
  "message": "Alert rule deleted successfully!"
}
```

---

### 4. ACTION ENDPOINTS

#### 4.1 Log Action
**POST** `/api/action/log`

Record staff action taken on a batch (remove, dispose, return, etc).

**Request:**
```json
{
  "batchId": "507f1f77bcf86cd799439012",
  "alertId": "507f1f77bcf86cd799439013",
  "actionType": "DISPOSED",
  "quantityAffected": 10,
  "performedBy": "John Doe",
  "notes": "Found leaking bottles, discarded 10 units"
}
```

**Valid Action Types:**
- REMOVED_FROM_SHELF
- DISPOSED
- RETURNED_TO_SUPPLIER
- RECOUNTED
- OTHER

**Response (200):**
```json
{
  "message": "Action logged successfully!",
  "action": {
    "_id": "507f1f77bcf86cd799439015",
    "batchId": "507f1f77bcf86cd799439012",
    "alertId": "507f1f77bcf86cd799439013",
    "actionType": "DISPOSED",
    "quantityAffected": 10,
    "performedBy": "John Doe",
    "performedAt": "2026-03-12T14:30:00.000Z",
    "notes": "Found leaking bottles, discarded 10 units",
    "createdAt": "2026-03-12T14:30:00.000Z"
  },
  "batchUpdated": {
    "batchId": "507f1f77bcf86cd799439012",
    "newQuantityAvailable": 90
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid batch ID
- 400: Quantity cannot exceed available quantity
- 400: Invalid action type

---

#### 4.2 Get All Actions
**GET** `/api/action?page=1&limit=10&batchId=507f1f77bcf86cd799439012`

Retrieve paginated list of all recorded actions.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `batchId` (optional): Filter by batch ID

**Response (200):**
```json
{
  "actions": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "batchId": {
        "productId": { "name": "Coca Cola 500ml" }
      },
      "actionType": "DISPOSED",
      "quantityAffected": 10,
      "performedBy": "John Doe",
      "performedAt": "2026-03-12T14:30:00.000Z",
      "notes": "Found leaking bottles"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

---

#### 4.3 Get Action by ID
**GET** `/api/action/:actionId`

Retrieve details of a specific action.

**Response (200):**
```json
{
  "action": {
    "_id": "507f1f77bcf86cd799439015",
    "batchId": {
      "_id": "507f1f77bcf86cd799439012",
      "productId": { "name": "Coca Cola 500ml" }
    },
    "alertId": {
      "_id": "507f1f77bcf86cd799439013",
      "alertType": "NEAR_EXPIRY"
    },
    "actionType": "DISPOSED",
    "quantityAffected": 10,
    "performedBy": "John Doe",
    "performedAt": "2026-03-12T14:30:00.000Z",
    "notes": "Found leaking bottles"
  }
}
```

---

#### 4.4 Get Actions by Batch
**GET** `/api/action/batch/:batchId`

Get all actions recorded for a specific batch.

**Response (200):**
```json
{
  "actions": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "actionType": "DISPOSED",
      "quantityAffected": 10,
      "performedBy": "John Doe",
      "performedAt": "2026-03-12T14:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Important Deployment Notes

### 1. Install node-cron Dependency
You need to install `node-cron` for the background job to work:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### 2. Background Job Schedule
The expiry engine runs automatically **daily at 2:00 AM**. In the `src/jobs/cron.ts` file, you can modify the schedule:
```typescript
// Change this line to adjust time:
cron.schedule('0 2 * * *', async () => { ... });
// Current: 0 2 * * * = 2:00 AM every day
// Format: [minute] [hour] [day] [month] [day-of-week]
```

### 3. What the Expiry Engine Does (Daily)
1. Fetches all ACTIVE and NEAR_EXPIRY batches
2. Calculates days until expiry for each batch
3. Updates batch status based on days remaining
4. Creates alerts for batches meeting alert rules
5. Prevents duplicate alerts (no more than 1 per batch per 24 hours)
6. Logs all operations to console

### 4. Alert Deduplication
The system prevents alert spam by:
- Not creating duplicate alerts for the same batch within 24 hours
- Requires staff to acknowledge alerts manually
- Only creates EMAIL and IN_APP notification records (ready for consumption)

### 5. Testing the Expiry Engine
You can trigger the expiry engine manually for testing. Add this endpoint to your testing:

**Temporary Manual Trigger Endpoint** (optional, for testing):
You can add this to a test router or remove later:
```typescript
import { triggerExpiryEngineNow } from '#/jobs/expiryEngine';

router.post('/test/trigger-expiry-engine', async (req, res) => {
  try {
    const result = await triggerExpiryEngineNow();
    res.json({ message: "Expiry engine triggered", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Frontend Integration Points

### Recommended Admin Dashboard Features

1. **Alert Dashboard**
   - Display count of NEAR_EXPIRY and EXPIRED batches
   - Show open unacknowledged alerts
   - Quick action buttons: Acknowledge, Log Action

2. **Batch Management**
   - Create new batches (form with product selector, expiry date, quantity)
   - View all batches sorted by urgency (expired first)
   - Filter by status and product
   - Quick view of product details + expiry info

3. **Action Logging**
   - Modal/form to log action for each batch
   - Pre-fill batch info and product name
   - Action type dropdown
   - Quantity input with max quantity validation
   - Notes textarea

4. **Alerts History**
   - Show all acknowledged and unacknowledged alerts
   - Display which staff member acknowledged and when
   - Link to batch and action history

5. **Reports/Analytics**
   - Total units lost to expiry (sum of quantity_affected)
   - Average response time (from alert to action)
   - Batches by status breakdown
   - Most common expiry issues

---

## Sample Request/Response Flow

### Scenario: Creating and Handling an Expiry Alert

**Day 1: Staff creates batch**
```
POST /api/batch/create
{
  "productId": "507f123...",
  "expiryDate": "2026-03-15",
  "quantityTotal": 100
}
```

**Day 1 at 2 AM: Expiry engine runs (automatic)**
- Calculates: 18 days to expiry
- Status: ACTIVE (no alert needed)

**Day 12 at 2 AM: Expiry engine runs again**
- Calculates: 3 days to expiry
- Status: NEAR_EXPIRY
- Creates Alert with type: NEAR_EXPIRY

**Day 12 afternoon: Staff checks dashboard**
```
GET /api/alert/open
```
- Sees the NEAR_EXPIRY alert
- Acknowledges it:

```
PATCH /api/alert/{alertId}/acknowledge
{
  "acknowledgedBy": "John Doe"
}
```

**Day 12 evening: Staff logs action**
```
POST /api/action/log
{
  "batchId": "...",
  "alertId": "...",
  "actionType": "DISPOSED",
  "quantityAffected": 5,
  "performedBy": "John Doe",
  "notes": "Found 5 damaged units, rest OK"
}
```

**System updates:**
- Batch quantityAvailable: 100 → 95
- Action recorded with timestamp
- Batch stays NEAR_EXPIRY (still has good stock)

---

## Error Handling Guidelines

All errors follow this format:
```json
{
  "message": "Descriptive error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation error)
- 403: Unauthorized (not admin)
- 500: Server Error

---

## Database Schema Reference

### Collections Used:
- `batches` - Batch records
- `alerts` - Alert records (created by expiry engine)
- `actions` - Staff action logs
- `alertrules` - Alert rule configurations
- `notifications` - Notification queue (EMAIL, IN_APP)

---

Generated: 2026-02-25
Last Updated: For MVP v1.0
