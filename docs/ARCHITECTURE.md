# Architecture - Contract Management System

## 0. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ React SPA │  │ Ant      │  │ TanStack │  │ Axios        │  │
│  │ + Vite    │  │ Design   │  │ Query    │  │ HTTP Client  │  │
│  └───────────┘  └──────────┘  └──────────┘  └──────┬───────┘  │
└─────────────────────────────────────────────────────┼──────────┘
                                                      │ HTTP/REST
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Express + TypeScript)                │
│                                                                 │
│  ┌──────────────────────── API Layer ────────────────────────┐  │
│  │  auth.routes │ contract.routes │ partner.routes │ ...     │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────── Middleware ──┼──────────────────────────────┐   │
│  │  requireAuth │ requireRole │ validate(Zod) │ multer     │   │
│  └──────────────────────────┼─────────────────────────────┘    │
│                             │                                   │
│  ┌──────────── Service Layer ┼──────────────────────────────┐  │
│  │  contract.service │ auth.service │ dashboard.service      │  │
│  │  notification.service │ audit.service │ email.service     │  │
│  │  export.service │ partner.service │ user.service          │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                   │
│  ┌─────── Infrastructure ───┼──────────────────────────────┐   │
│  │  Prisma ORM │ node-cron │ nodemailer │ multer(disk)     │   │
│  └──────────────────────────┼─────────────────────────────┘    │
└─────────────────────────────┼──────────────────────────────────┘
                              │ TCP/5432
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Docker)                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │ users    │ │contracts │ │ partners  │ │ audit_logs       │ │
│  │ sessions │ │approvals │ │attachments│ │ notifications    │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     File System (Docker Volume)                  │
│  uploads/contracts/{contract_id}/{uuid}-{filename}.pdf          │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow
```
Browser → Axios → Express Router → Middleware (Auth/Validate) → Service → Prisma → PostgreSQL
                                                                    │
                                                              Audit Log
                                                              Notification
                                                              Email (SMTP)
```

### Approval Workflow State Machine
```
  ┌───────┐   submit    ┌──────────────┐  legal-approve  ┌──────────────────┐  manager-approve  ┌────────┐
  │ DRAFT ├────────────►│ LEGAL_REVIEW ├────────────────►│ MANAGER_APPROVAL ├─────────────────►│ SIGNED │
  └───┬───┘             └──────┬───────┘                 └────────┬─────────┘                  └────┬───┘
      ▲                        │                                  │                                 │
      │    legal-reject        │         manager-reject           │            cron (expiry)        │
      └────────────────────────┘                                  │                                 ▼
      ▲                                                           │                          ┌──────────┐
      └───────────────────────────────────────────────────────────┘                          │ EXPIRED  │
                                                                                             └──────────┘
```

---

## 1. Tech Stack

| Layer | Technology | Lý do |
|-------|-----------|-------|
| **Backend** | Node.js + Express + TypeScript | Type-safe, ecosystem lớn, phù hợp internal tool |
| **ORM** | Prisma | Type-safe queries, migration tốt, generate types từ schema |
| **Database** | PostgreSQL | JSONB cho audit log, full-text search, date range queries |
| **Frontend** | React + Vite + TypeScript | Nhanh, ecosystem lớn |
| **UI Library** | Ant Design | Component enterprise-grade (Table, Form, Upload, DatePicker) |
| **State/Data** | TanStack Query | Cache, refetch, optimistic updates cho workflow |
| **Charts** | @ant-design/charts | Tích hợp tốt với Ant Design |
| **Auth** | express-session + bcrypt | Đơn giản cho internal tool, session-based |
| **File Upload** | multer | Disk storage, 20MB limit |
| **Validation** | Zod | Schema validation shared giữa client/server |
| **Cron** | node-cron | Check hết hạn hàng ngày, in-process |
| **Email** | nodemailer | Gửi email cảnh báo hết hạn + thông báo phê duyệt |

## 2. Cấu trúc thư mục

```
contract-manager-pproval/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── CHANGELOG.md
├── docker-compose.yml          # PostgreSQL
├── package.json                # Workspace root
├── .env.example
├── .gitignore
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma       # Data model
│   │   └── seed.ts             # Default users + sample data
│   └── src/
│       ├── index.ts            # Express entry point
│       ├── config/
│       │   └── env.ts          # Environment variables
│       ├── middleware/
│       │   ├── auth.ts         # requireAuth, requireRole
│       │   ├── upload.ts       # multer config (20MB, PDF only)
│       │   ├── validate.ts     # Zod validation middleware
│       │   └── error.ts        # Global error handler
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── contract.routes.ts
│       │   ├── partner.routes.ts
│       │   ├── attachment.routes.ts
│       │   ├── dashboard.routes.ts
│       │   ├── notification.routes.ts
│       │   └── user.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── contract.service.ts
│       │   ├── partner.service.ts
│       │   ├── attachment.service.ts
│       │   ├── dashboard.service.ts
│       │   ├── notification.service.ts
│       │   ├── email.service.ts
│       │   ├── audit.service.ts
│       │   └── user.service.ts
│       ├── validators/
│       │   ├── contract.schema.ts
│       │   ├── partner.schema.ts
│       │   └── auth.schema.ts
│       ├── jobs/
│       │   └── expiry-check.ts # Cron job
│       ├── utils/
│       │   ├── contract-number.ts
│       │   └── pagination.ts
│       └── types/
│           └── index.ts
│
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   ├── client.ts       # Axios instance
│       │   ├── contracts.ts    # Contract query hooks
│       │   ├── partners.ts
│       │   ├── dashboard.ts
│       │   ├── notifications.ts
│       │   └── auth.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Header.tsx
│       │   ├── contracts/
│       │   │   ├── ContractTable.tsx
│       │   │   ├── ContractForm.tsx
│       │   │   ├── ContractInfo.tsx
│       │   │   ├── ApprovalActions.tsx
│       │   │   ├── ApprovalHistory.tsx
│       │   │   ├── AttachmentList.tsx
│       │   │   ├── RenewalChain.tsx
│       │   │   ├── FilterBar.tsx
│       │   │   └── StatusBadge.tsx
│       │   ├── dashboard/
│       │   │   ├── SummaryCards.tsx
│       │   │   ├── ValueByTypeChart.tsx
│       │   │   └── ExpiringTable.tsx
│       │   └── shared/
│       │       ├── RoleGuard.tsx
│       │       ├── FileUpload.tsx
│       │       ├── CurrencyDisplay.tsx
│       │       └── NotificationDropdown.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ContractListPage.tsx
│       │   ├── ContractDetailPage.tsx
│       │   ├── ContractFormPage.tsx
│       │   ├── PartnerListPage.tsx
│       │   ├── PartnerFormPage.tsx
│       │   ├── UserListPage.tsx
│       │   └── UserFormPage.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useNotifications.ts
│       ├── contexts/
│       │   └── AuthContext.tsx
│       └── utils/
│           ├── format.ts       # Currency, date formatting
│           └── constants.ts    # Vietnamese labels
```

## 3. Database Schema

### ERD (Entity Relationship)

```
users ──┐
        ├──< contracts >──── partners
        │       │
        │       ├──< contract_attachments
        │       ├──< approval_actions
        │       └──< notifications
        │
        └──< audit_logs
```

### Enums

- **Role**: `LEGAL_ADMIN` | `MANAGER` | `VIEWER`
- **ContractType**: `SALES` | `SERVICE` | `LABOR` | `LEASE` | `OTHER`
- **ContractStatus**: `DRAFT` | `LEGAL_REVIEW` | `MANAGER_APPROVAL` | `SIGNED` | `EXPIRED` | `CANCELLED`
- **ApprovalAction**: `SUBMIT` | `APPROVE` | `REJECT` | `CANCEL`

### Tables

**users**: id, email, password_hash, full_name, role, is_active, created_at, updated_at

**partners**: id, name, tax_code, address, contact_name, contact_email, contact_phone, created_at, updated_at

**contracts**: id, contract_number (unique auto), title, type, status, partner_id (FK), value (DECIMAL 15,2), signing_date, effective_date, expiry_date, description, parent_id (FK self-ref), version, created_by (FK), updated_by (FK), created_at, updated_at

**contract_attachments**: id, contract_id (FK), file_name, file_path, file_size, mime_type, uploaded_by (FK), created_at

**approval_actions**: id, contract_id (FK), from_status, to_status, action, comment, acted_by (FK), created_at

**audit_logs**: id, entity_type, entity_id, action, changes (JSONB), performed_by (FK), ip_address, created_at

**notifications**: id, user_id (FK), contract_id (FK), type, title, message, is_read, created_at

## 4. API Design

### Authentication
```
POST   /api/auth/login              { email, password }
POST   /api/auth/logout
GET    /api/auth/me                 → current user + role
```

### Contracts
```
GET    /api/contracts               ?partner=&type=&status=&from=&to=&search=&page=&limit=
POST   /api/contracts               [LEGAL_ADMIN]
GET    /api/contracts/:id
PUT    /api/contracts/:id           [LEGAL_ADMIN]

POST   /api/contracts/:id/submit              Draft → Legal Review
POST   /api/contracts/:id/legal-approve       Legal Review → Manager Approval
POST   /api/contracts/:id/legal-reject        Legal Review → Draft
POST   /api/contracts/:id/manager-approve     Manager Approval → Signed
POST   /api/contracts/:id/manager-reject      Manager Approval → Draft

POST   /api/contracts/:id/renew               → new version
GET    /api/contracts/:id/versions             → version chain
GET    /api/contracts/:id/history              → approval timeline
```

### Attachments
```
POST   /api/contracts/:id/attachments         multipart (20MB, PDF)
GET    /api/contracts/:id/attachments
GET    /api/attachments/:id/download
DELETE /api/attachments/:id
```

### Partners, Dashboard, Notifications, Users
```
GET/POST/PUT   /api/partners
GET            /api/dashboard/summary|by-type|by-status|expiring
GET/PATCH      /api/notifications
GET/POST/PUT   /api/users                    [MANAGER]
```

## 5. Data Flow

### Approval Workflow
```
1. Legal Admin tạo hợp đồng → status: DRAFT
2. Legal Admin submit → status: LEGAL_REVIEW → notify Legal Admins
3. Legal Admin approve → status: MANAGER_APPROVAL → notify Managers
   Legal Admin reject → status: DRAFT → notify creator
4. Manager approve → status: SIGNED → notify creator
   Manager reject → status: DRAFT → notify creator
```

### Expiry Alert Flow
```
1. Cron job chạy 8:00 AM UTC+7 hàng ngày
2. Query contracts: status=SIGNED AND expiry_date within 30/60/90 days
3. Tạo notification records (deduplicate)
4. Gửi email qua nodemailer
5. Contracts quá hạn → auto update status: EXPIRED
```

### File Upload Flow
```
1. Client: Ant Design Upload → validate PDF, ≤20MB
2. Server: multer middleware → save to uploads/contracts/{contract_id}/{uuid}-{name}.pdf
3. DB: Insert contract_attachments record
4. View: Browser native PDF viewer (iframe / new tab)
```

## 6. Authentication & Authorization

- **Session-based**: express-session + connect-pg-simple (PostgreSQL session store)
- **Password**: bcrypt hash
- **Middleware**: `requireAuth` (check session) → `requireRole(...roles)` (check user.role)
- Không dùng JWT vì internal tool, session dễ invalidate khi logout

## 7. Key Design Decisions

| Decision | Choice | Lý do |
|----------|--------|-------|
| Auth | Session-based | Internal tool, không cần stateless JWT |
| Workflow | Simple transition map | Chỉ 4 states, 5 transitions, không cần state machine library |
| File storage | Local disk | Internal tool scale nhỏ, dễ migrate S3 sau |
| PDF viewer | Browser native | Zero dependency, đủ cho use case |
| Audit | Separate tables | `approval_actions` cho workflow, `audit_logs` cho generic changes |
| UI | Ant Design | Enterprise-grade, phù hợp data-heavy admin tool |
| Currency | VND only | Đủ cho nhu cầu hiện tại |
