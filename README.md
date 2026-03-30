# Contract Management System

Hệ thống quản lý hợp đồng nội bộ cho phòng pháp lý và kinh doanh, hỗ trợ workflow phê duyệt, cảnh báo hết hạn, và dashboard tổng hợp.

## Tính năng chính

- **Quản lý hợp đồng**: Tạo, sửa, tìm kiếm hợp đồng với file đính kèm PDF
- **Workflow phê duyệt**: Draft → Legal Review → Manager Approval → Signed
- **Cảnh báo hết hạn**: Thông báo in-app + email khi hợp đồng sắp hết hạn (30/60/90 ngày)
- **Gia hạn hợp đồng**: Tạo phiên bản mới liên kết với hợp đồng gốc
- **Dashboard**: Tổng hợp giá trị hợp đồng theo loại, trạng thái
- **Phân quyền**: Legal Admin, Manager, Viewer

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript + Ant Design
- **Email**: Nodemailer (SMTP)

## Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 15
- Docker & Docker Compose (khuyến nghị cho database)

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone <repo-url>
cd contract-manager-pproval
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database và SMTP
```

### 4. Khởi động database

```bash
docker compose up -d
```

### 5. Chạy migration & seed

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 6. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### Tài khoản mặc định

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@company.com | admin123 | MANAGER |
| legal@company.com | legal123 | LEGAL_ADMIN |
| viewer@company.com | viewer123 | VIEWER |

## Tài liệu

- [PRD - Yêu cầu sản phẩm](docs/PRD.md)
- [Architecture - Kiến trúc hệ thống](docs/ARCHITECTURE.md)
- [Changelog - Lịch sử thay đổi](docs/CHANGELOG.md)
