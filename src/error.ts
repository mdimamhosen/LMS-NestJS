/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, unknown>;

        // Extract message safely
        if ('message' in body) {
          const m = body.message;
          if (Array.isArray(m)) {
            message = m.map((v) => String(v));
          } else if (typeof m === 'string') {
            message = m;
          } else {
            message = exception.message;
          }
        } else {
          message = exception.message;
        }

        // Extract error safely
        if ('error' in body && typeof body.error === 'string') {
          error = body.error;
        }
      }
    }
    // Handle Mongoose Validation Errors
    else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = Object.values(exception.errors).map((err) => err.message);
    }
    // Handle Mongoose Cast Errors (Invalid ObjectId)
    else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Invalid ID';
      message = `Invalid ${exception.path}: ${exception.value}`;
    }
    // Handle Mongoose Duplicate Key Errors
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code?: number }).code === 11000
    ) {
      status = HttpStatus.CONFLICT;
      error = 'Duplicate Entry';

      const ex = exception as {
        keyPattern?: Record<string, unknown>;
        keyValue?: Record<string, unknown>;
      };

      let field = '';
      if (ex.keyPattern && typeof ex.keyPattern === 'object') {
        field = Object.keys(ex.keyPattern)[0] ?? '';
      } else if (ex.keyValue && typeof ex.keyValue === 'object') {
        field = Object.keys(ex.keyValue)[0] ?? '';
      }

      message = field ? `${field} already exists` : 'Duplicate entry';
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${
        exception instanceof Error ? exception.stack : JSON.stringify(exception)
      }`,
    );

    // Send error response
    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}