# API Documentation - Contract Management System

Base URL: `http://localhost:3001/api`

## Authentication

Session-based authentication. All endpoints (except login) require a valid session cookie.

---

## Auth

### POST /auth/login
Login and create session.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "fullName": "Nguyen Van Admin",
    "role": "MANAGER",
    "isActive": true
  }
}
```

**Response 401:** `{ "error": "Email hoac mat khau khong dung" }`

### POST /auth/logout
Destroy session.

**Response 200:** `{ "message": "Dang xuat thanh cong" }`

### GET /auth/me
Get current authenticated user.

**Response 200:** `{ "user": { ... } }`

---

## Contracts

### GET /contracts
List contracts with filters and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Search by contract number, title, partner name |
| type | enum | SALES, SERVICE, LABOR, LEASE, OTHER |
| status | enum | DRAFT, LEGAL_REVIEW, MANAGER_APPROVAL, SIGNED, EXPIRED, CANCELLED |
| partner | uuid | Filter by partner ID |
| from | ISO date | Created after this date |
| to | ISO date | Created before this date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "contractNumber": "HD-2026-0001",
      "title": "Hop dong dich vu CNTT",
      "type": "SERVICE",
      "status": "SIGNED",
      "value": "500000000",
      "expiryDate": "2026-12-31",
      "partner": { "id": "uuid", "name": "Cong ty ABC" },
      "createdBy": { "id": "uuid", "fullName": "Tran Thi Legal" }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### GET /contracts/:id
Get contract detail with relations.

**Response 200:** Contract object with partner, attachments, approvals, parent, renewals.

### POST /contracts
Create new contract. **Role: LEGAL_ADMIN**

**Request Body:**
```json
{
  "title": "Hop dong mua ban thiet bi",
  "type": "SALES",
  "partnerId": "uuid",
  "value": 150000000,
  "signingDate": "2026-01-15T00:00:00.000Z",
  "effectiveDate": "2026-02-01T00:00:00.000Z",
  "expiryDate": "2026-12-31T00:00:00.000Z",
  "description": "Mo ta hop dong"
}
```

**Response 201:** Created contract object.

### PUT /contracts/:id
Update contract (only DRAFT status). **Role: LEGAL_ADMIN**

**Request Body:** Partial contract fields (same as create).

**Response 200:** Updated contract object.
**Response 400:** `{ "error": "Chi co the sua hop dong o trang thai Nhap" }`

---

## Workflow Transitions

All workflow endpoints accept optional comment body: `{ "comment": "Ly do" }`

### POST /contracts/:id/submit
Submit for legal review. **Role: LEGAL_ADMIN**
- Transition: DRAFT -> LEGAL_REVIEW
- Notifies: All Legal Admins (in-app + email)

### POST /contracts/:id/legal-approve
Legal team approves. **Role: LEGAL_ADMIN**
- Transition: LEGAL_REVIEW -> MANAGER_APPROVAL
- Notifies: All Managers (in-app + email)

### POST /contracts/:id/legal-reject
Legal team rejects. **Role: LEGAL_ADMIN**
- Transition: LEGAL_REVIEW -> DRAFT
- Notifies: Contract creator

### POST /contracts/:id/manager-approve
Manager approves. **Role: MANAGER**
- Transition: MANAGER_APPROVAL -> SIGNED
- Notifies: Contract creator

### POST /contracts/:id/manager-reject
Manager rejects. **Role: MANAGER**
- Transition: MANAGER_APPROVAL -> DRAFT
- Notifies: Contract creator

**Response 200:** Updated contract object.
**Response 400:** `{ "error": "Khong the chuyen trang thai" }`

---

## Contract Renewal

### POST /contracts/:id/renew
Create renewal version. **Role: LEGAL_ADMIN**
- Only for SIGNED or EXPIRED contracts
- Creates new contract linked via parent_id, version incremented

**Response 201:** New contract object.

### GET /contracts/:id/versions
Get version chain for a contract.

**Response 200:**
```json
[
  { "id": "uuid", "contractNumber": "HD-2026-0001", "version": 1, "status": "EXPIRED" },
  { "id": "uuid", "contractNumber": "HD-2026-0005", "version": 2, "status": "SIGNED" }
]
```

### GET /contracts/:id/history
Get approval action history.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "fromStatus": "DRAFT",
    "toStatus": "LEGAL_REVIEW",
    "action": "SUBMIT",
    "comment": null,
    "actedBy": { "id": "uuid", "fullName": "Tran Thi Legal" },
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
]
```

---

## Attachments

### POST /contracts/:id/attachments
Upload PDF file. **Role: LEGAL_ADMIN**
- Content-Type: multipart/form-data
- Field name: `file`
- Max size: 20MB
- Accepted: application/pdf only

**Response 201:** Attachment object.
**Response 400:** `{ "error": "Chi chap nhan file PDF" }` or `{ "error": "File vuot qua 20MB" }`

### GET /contracts/:id/attachments
List attachments for a contract.

### GET /attachments/:id/download
Download attachment file.

### GET /attachments/:id/view
View PDF in browser (inline Content-Disposition).

### DELETE /attachments/:id
Delete attachment. **Role: LEGAL_ADMIN**

---

## Partners

### GET /partners
List partners with search and pagination.

**Query Parameters:** search, page, limit

### GET /partners/:id
Get partner detail.

### POST /partners
Create partner. **Role: LEGAL_ADMIN, MANAGER**

**Request Body:**
```json
{
  "name": "Cong ty TNHH ABC",
  "taxCode": "0123456789",
  "address": "123 Nguyen Hue, Q.1, TP.HCM",
  "contactName": "Pham Van A",
  "contactEmail": "contact@abc.com.vn",
  "contactPhone": "028-1234-5678"
}
```

### PUT /partners/:id
Update partner. **Role: LEGAL_ADMIN, MANAGER**

---

## Dashboard

### GET /dashboard/summary
**Response 200:**
```json
{
  "totalContracts": 50,
  "totalValue": "15000000000",
  "pendingApprovals": 5,
  "byStatus": [
    { "status": "SIGNED", "count": 30, "value": "10000000000" }
  ]
}
```

### GET /dashboard/by-type
Aggregate contracts by type. Returns array of `{ type, count, value }`.

### GET /dashboard/by-status
Aggregate contracts by status. Returns array of `{ status, count, value }`.

### GET /dashboard/expiring
Contracts expiring within 90 days.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "contractNumber": "HD-2026-0001",
    "title": "...",
    "partner": { "name": "ABC" },
    "expiryDate": "2026-04-30",
    "daysLeft": 25,
    "urgency": "critical"
  }
]
```
Urgency levels: `critical` (<=30 days), `warning` (<=60), `info` (<=90)

---

## Export

### GET /export/contracts
Export contracts to Excel file.

**Query Parameters:** Same filters as GET /contracts (partner, type, status, from, to)

**Response:** Excel file (.xlsx) download.

---

## Notifications

### GET /notifications
List notifications for current user.

**Query Parameters:** is_read (true/false), page, limit

### GET /notifications/unread-count
**Response 200:** `{ "count": 5 }`

### PATCH /notifications/:id/read
Mark single notification as read.

### PATCH /notifications/read-all
Mark all notifications as read.

---

## Users

All user endpoints require **MANAGER** role.

### GET /users
List users with pagination.

### POST /users
Create user.

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "fullName": "Nguyen Van X",
  "role": "VIEWER",
  "password": "password123"
}
```

### PUT /users/:id
Update user (fullName, role, isActive, password).

---

## Health Check

### GET /health
**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-30T08:00:00.000Z"
}
```

**Response 503:** `{ "status": "error", "database": "disconnected" }`

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Thong bao loi than thien"
}
```

Validation errors include details:
```json
{
  "error": "Du lieu khong hop le",
  "details": [
    { "field": "email", "message": "Email khong hop le" }
  ]
}
```

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / Validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Not found |
| 500 | Server error |
| 503 | Service unavailable (DB down) |
