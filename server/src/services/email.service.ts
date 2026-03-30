import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams) {
  if (!env.smtp.user) {
    console.log('[Email] SMTP not configured, skipping email:', params.subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    console.log(`[Email] Sent to ${params.to}: ${params.subject}`);
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }
}

export function expiryAlertEmail(contractNumber: string, title: string, daysLeft: number, expiryDate: string) {
  return {
    subject: `[Cảnh báo] Hợp đồng ${contractNumber} sắp hết hạn trong ${daysLeft} ngày`,
    html: `
      <h2>Cảnh báo hợp đồng sắp hết hạn</h2>
      <p><strong>Số hợp đồng:</strong> ${contractNumber}</p>
      <p><strong>Tiêu đề:</strong> ${title}</p>
      <p><strong>Ngày hết hạn:</strong> ${expiryDate}</p>
      <p><strong>Còn lại:</strong> ${daysLeft} ngày</p>
      <p>Vui lòng kiểm tra và xử lý gia hạn nếu cần.</p>
    `,
  };
}

export function approvalNeededEmail(contractNumber: string, title: string, status: string) {
  return {
    subject: `[Phê duyệt] Hợp đồng ${contractNumber} cần phê duyệt`,
    html: `
      <h2>Hợp đồng cần phê duyệt</h2>
      <p><strong>Số hợp đồng:</strong> ${contractNumber}</p>
      <p><strong>Tiêu đề:</strong> ${title}</p>
      <p><strong>Trạng thái:</strong> ${status}</p>
      <p>Vui lòng đăng nhập hệ thống để phê duyệt.</p>
    `,
  };
}
