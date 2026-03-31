jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

jest.mock('../../config/env', () => ({
  env: {
    smtp: {
      host: 'smtp.test.com',
      port: 587,
      user: '',
      pass: '',
      from: 'test@company.com',
    },
  },
}));

import { sendEmail } from '../../services/email.service';

describe('EmailService - No SMTP', () => {
  it('should skip sending when SMTP user is empty', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Test</p>' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('SMTP not configured'),
      expect.anything(),
    );
    consoleSpy.mockRestore();
  });
});
