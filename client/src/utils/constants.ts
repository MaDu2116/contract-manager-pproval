export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  SALES: 'Mua bán',
  SERVICE: 'Dịch vụ',
  LABOR: 'Lao động',
  LEASE: 'Thuê',
  OTHER: 'Khác',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  LEGAL_REVIEW: 'Review pháp lý',
  MANAGER_APPROVAL: 'Chờ phê duyệt',
  SIGNED: 'Đã ký',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default',
  LEGAL_REVIEW: 'processing',
  MANAGER_APPROVAL: 'warning',
  SIGNED: 'success',
  EXPIRED: 'error',
  CANCELLED: 'default',
};

export const ROLE_LABELS: Record<string, string> = {
  LEGAL_ADMIN: 'Legal Admin',
  MANAGER: 'Manager',
  VIEWER: 'Viewer',
};

export const APPROVAL_ACTION_LABELS: Record<string, string> = {
  SUBMIT: 'Nộp',
  APPROVE: 'Phê duyệt',
  REJECT: 'Từ chối',
  CANCEL: 'Hủy',
};
