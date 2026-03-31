import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/error';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {};
    mockRes = { status: statusMock };
    mockNext = jest.fn();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle PDF error', () => {
    const err = new Error('Chỉ chấp nhận file PDF');

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Chỉ chấp nhận file PDF' });
  });

  it('should handle file too large error', () => {
    const err = new Error('File too large');

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'File vượt quá 20MB' });
  });

  it('should handle generic errors', () => {
    const err = new Error('Something went wrong');

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Lỗi hệ thống' });
  });
});
