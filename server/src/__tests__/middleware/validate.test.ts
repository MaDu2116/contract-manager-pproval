import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = { body: {} };
    mockRes = { status: statusMock };
    mockNext = jest.fn();
  });

  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  it('should call next on valid data', () => {
    mockReq.body = { name: 'Test', email: 'test@test.com' };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should return 400 with details on invalid data', () => {
    mockReq.body = { name: '', email: 'invalid' };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Dữ liệu không hợp lệ',
      details: expect.arrayContaining([
        expect.objectContaining({ field: expect.any(String) }),
      ]),
    }));
  });

  it('should call next(error) on non-Zod error', () => {
    const badSchema = {
      parse: () => { throw new Error('unexpected'); },
    };

    const middleware = validate(badSchema as unknown as z.ZodSchema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
