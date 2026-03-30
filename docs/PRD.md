# PRD - Contract Management System

## 1. Tổng quan

Hệ thống quản lý hợp đồng nội bộ cho phòng pháp lý và kinh doanh. Thay thế quy trình lưu trữ hợp đồng trên Drive không có cấu trúc và ký kết thủ công qua email.

## 2. Đối tượng sử dụng

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| **Legal Admin** | Nhân viên pháp lý | Tạo/sửa hợp đồng, upload file, submit & legal review |
| **Manager** | Quản lý | Phê duyệt/từ chối hợp đồng, quản lý user |
| **Viewer** | Nhân viên xem | Chỉ xem hợp đồng và dashboard |

## 3. Yêu cầu chức năng

### 3.1 Quản lý hợp đồng (CRUD)

- Tạo hợp đồng với các thông tin: số hợp đồng (tự động), tiêu đề, loại, đối tác, ngày ký, ngày hết hạn, giá trị (VND), mô tả
- Loại hợp đồng: Mua bán, Dịch vụ, Lao động, Thuê, Khác
- Đính kèm file PDF (tối đa 20MB/file, không giới hạn số lượng)
- Số hợp đồng tự động: `HD-{năm}-{số thứ tự 4 chữ số}` (VD: HD-2026-0001)

**User Stories:**
- US-01: Legal Admin tạo hợp đồng mới với đầy đủ thông tin và file đính kèm
- US-02: Legal Admin sửa thông tin hợp đồng ở trạng thái Draft
- US-03: Người dùng xem chi tiết hợp đồng bao gồm file PDF (browser native viewer)
- US-04: Người dùng tải file PDF đính kèm về máy

### 3.2 Workflow phê duyệt

```
DRAFT → LEGAL_REVIEW → MANAGER_APPROVAL → SIGNED
  ↑         |                |
  └─────────┘ (reject)       │
  ↑                          |
  └──────────────────────────┘ (reject)
```

- Legal Admin: Submit (Draft → Legal Review), Legal Approve/Reject
- Manager: Manager Approve/Reject
- Reject quay về Draft kèm comment lý do
- Mỗi bước ghi nhận người thực hiện, thời gian, comment

**User Stories:**
- US-05: Legal Admin submit hợp đồng để review
- US-06: Legal Admin approve/reject hợp đồng sau khi review pháp lý
- US-07: Manager approve/reject hợp đồng
- US-08: Người dùng xem lịch sử phê duyệt (timeline)

### 3.3 Cảnh báo hết hạn

- Cron job chạy hàng ngày 8:00 AM (UTC+7)
- Tạo notification + gửi email khi hợp đồng còn 30/60/90 ngày
- Tự động chuyển trạng thái SIGNED → EXPIRED khi quá hạn
- Thông báo in-app (notification bell) + email

**User Stories:**
- US-09: Legal Admin nhận thông báo email khi hợp đồng sắp hết hạn
- US-10: Manager nhận thông báo in-app về hợp đồng cần gia hạn

### 3.4 Gia hạn hợp đồng

- Tạo phiên bản mới liên kết với hợp đồng gốc qua `parent_id`
- Copy thông tin từ hợp đồng cũ, tăng `version`
- Hợp đồng mới bắt đầu từ trạng thái DRAFT
- Hiển thị chuỗi phiên bản trên trang chi tiết

**User Stories:**
- US-11: Legal Admin gia hạn hợp đồng, tạo phiên bản mới từ hợp đồng gốc
- US-12: Người dùng xem lịch sử các phiên bản hợp đồng

### 3.5 Tìm kiếm & Lọc

- Lọc theo: đối tác, loại hợp đồng, trạng thái, khoảng thời gian
- Tìm kiếm theo: số hợp đồng, tiêu đề, tên đối tác
- Phân trang, sắp xếp theo ngày tạo/hết hạn/giá trị

**User Stories:**
- US-13: Người dùng tìm kiếm hợp đồng theo từ khóa
- US-14: Người dùng lọc hợp đồng theo nhiều tiêu chí kết hợp

### 3.6 Dashboard

- Tổng số hợp đồng, tổng giá trị
- Biểu đồ giá trị theo loại hợp đồng (pie chart)
- Biểu đồ số lượng theo trạng thái (bar chart)
- Bảng hợp đồng sắp hết hạn (30/60/90 ngày)

**User Stories:**
- US-15: Manager xem tổng quan giá trị hợp đồng trên dashboard
- US-16: Người dùng xem danh sách hợp đồng sắp hết hạn

## 4. Yêu cầu phi chức năng

### 4.1 Phân quyền

| Chức năng | VIEWER | LEGAL_ADMIN | MANAGER |
|-----------|--------|-------------|---------|
| Xem hợp đồng, dashboard | ✅ | ✅ | ✅ |
| Tạo/sửa hợp đồng | ❌ | ✅ | ❌ |
| Upload file | ❌ | ✅ | ❌ |
| Submit, Legal approve/reject | ❌ | ✅ | ❌ |
| Manager approve/reject | ❌ | ❌ | ✅ |
| Quản lý đối tác | ❌ | ✅ | ✅ |
| Quản lý user | ❌ | ❌ | ✅ |

### 4.2 Audit Log

- Ghi nhận mọi thay đổi trạng thái hợp đồng
- Lưu: ai thay đổi, thời gian, giá trị cũ/mới (JSONB diff)
- Bảng `approval_actions` riêng cho workflow
- Bảng `audit_logs` chung cho mọi thay đổi khác

### 4.3 File Upload

- Chỉ chấp nhận file PDF
- Tối đa 20MB/file
- Lưu trữ local disk
- Xem PDF qua browser native (iframe/tab mới)

## 5. Tính năng bổ sung (Phase 2)

1. **Export báo cáo PDF/Excel** - Xuất danh sách hợp đồng theo bộ lọc
2. **Comment/Ghi chú nội bộ** - Trao đổi trên hợp đồng thay vì email
3. **Template hợp đồng** - Tạo nhanh từ mẫu có sẵn
4. **Bulk actions** - Phê duyệt hàng loạt, xuất nhiều hợp đồng

## 6. Tiêu chí chấp nhận (Acceptance Criteria)

- [ ] Login/logout hoạt động với 3 role
- [ ] CRUD hợp đồng đầy đủ với validation
- [ ] Workflow phê duyệt 4 bước hoạt động đúng
- [ ] Upload/xem/tải PDF hoạt động
- [ ] Cảnh báo hết hạn gửi notification + email
- [ ] Gia hạn hợp đồng tạo phiên bản mới liên kết
- [ ] Dashboard hiển thị đúng số liệu
- [ ] Audit log ghi nhận đầy đủ
