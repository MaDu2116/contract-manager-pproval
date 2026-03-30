# Prompt Log

## Session 1 - 2026-03-30

### Prompt 1: Yeu cau ban dau
**Input**: User cung cap yeu cau xay dung he thong quan ly hop dong noi bo voi:
- CRUD hop dong (loai, doi tac, ngay ky, het han, gia tri, PDF)
- Workflow phe duyet: Draft → Legal Review → Manager Approval → Signed
- Canh bao het han 30/60/90 ngay
- Gia han hop dong
- Tim kiem & loc
- Dashboard tong hop
- Phan quyen: Legal Admin, Manager, Viewer
- Audit log, File upload PDF 20MB

**Quyet dinh**:
1. Reject → quay ve DRAFT (khong tao status REJECTED rieng)
2. Notification: In-app + Email ngay tu dau (nodemailer + SMTP)
3. Currency: Chi VND
4. PDF Viewer: Browser native (iframe/tab moi)
5. File Storage: Local disk

### Prompt 2: Yeu cau bo sung
**Input**: User bo sung nhieu yeu cau phi chuc nang:
- AI-Log folder
- 10,000 users target
- UI 1080p compatible
- Input validation khong crash
- Response time < 3s
- Friendly error messages
- Docker/Docker Compose production-ready
- Coverage >= 60%
- CI/CD pipeline
- Health endpoint
- Structured logging
- run.bat one-click start
- API documentation
- Architecture diagram

**Quyet dinh**: Tich hop tat ca vao plan, them Phase 6-10
