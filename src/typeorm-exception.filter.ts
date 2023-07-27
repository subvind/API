import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const { code, detail, message }: any = exception;
    const errorMessage = `TypeORM Query Failed Error: ${message}, Code: ${code}, Detail: ${detail}`;

    response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: errorMessage,
    });
  }
}
