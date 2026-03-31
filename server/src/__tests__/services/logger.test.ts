describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleSpy?.mockRestore();
  });

  it('should log INFO messages in development', async () => {
    process.env.NODE_ENV = 'development';
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { logger } = await import('../../utils/logger');
    logger.info('Test message', { key: 'value' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Test message'),
    );
  });

  it('should log WARN messages', async () => {
    process.env.NODE_ENV = 'development';
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { logger } = await import('../../utils/logger');
    logger.warn('Warning message');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARN] Warning message'),
    );
  });

  it('should log ERROR messages', async () => {
    process.env.NODE_ENV = 'development';
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { logger } = await import('../../utils/logger');
    logger.error('Error message', { error: 'details' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Error message'),
    );
  });

  it('should log JSON in production', async () => {
    process.env.NODE_ENV = 'production';
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { logger } = await import('../../utils/logger');
    logger.info('Production log', { userId: '123' });

    const loggedStr = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(loggedStr);
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('Production log');
    expect(parsed.userId).toBe('123');
  });
});
