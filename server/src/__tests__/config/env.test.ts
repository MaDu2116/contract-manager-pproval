describe('Environment Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use default values', async () => {
    const { env } = await import('../../config/env');

    expect(env.port).toBe(3001);
    expect(env.nodeEnv).toBe('test');
    expect(env.sessionSecret).toBeDefined();
    expect(env.smtp.host).toBe('smtp.gmail.com');
    expect(env.smtp.port).toBe(587);
  });

  it('should use environment variables when set', async () => {
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'my-secret';

    const { env } = await import('../../config/env');

    expect(env.port).toBe(5000);
    expect(env.nodeEnv).toBe('production');
    expect(env.sessionSecret).toBe('my-secret');
  });
});
