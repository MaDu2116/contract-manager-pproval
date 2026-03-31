const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: (...args: unknown[]) => mockSendMail(...args),
  }),
}));

jest.mock('../../config/env', () => ({
  env: {
    smtp: {
      host: 'smtp.test.com',
      port: 587,
      user: 'testuser',
      pass: 'testpass',
      from: 'test@company.com',
    },
  },
}));

import { sendEmail, expiryAlertEmail, approvalNeededEmail } from '../../services/email.service';

describe('EmailService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('sendEmail', () => {
    it('should send email when SMTP is configured', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Test</p>' });

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'a@b.com',
        subject: 'Test',
        html: '<p>Test</p>',
      }));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sent to'));
      consoleSpy.mockRestore();
    });

    it('should handle send failure gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Connection refused'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Test</p>' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to send'), expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('expiryAlertEmail', () => {
    it('should generate expiry alert template', () => {
      const result = expiryAlertEmail('HD-2024-0001', 'Test Contract', 30, '2024-12-31');

      expect(result.subject).toContain('HD-2024-0001');
      expect(result.subject).toContain('30 ngày');
      expect(result.html).toContain('Test Contract');
      expect(result.html).toContain('2024-12-31');
    });
  });

  describe('approvalNeededEmail', () => {
    it('should generate approval needed template', () => {
      const result = approvalNeededEmail('HD-2024-0001', 'Test Contract', 'LEGAL_REVIEW');

      expect(result.subject).toContain('HD-2024-0001');
      expect(result.html).toContain('Test Contract');
      expect(result.html).toContain('LEGAL_REVIEW');
    });
  });
});
