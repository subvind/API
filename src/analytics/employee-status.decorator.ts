import { Reflector } from '@nestjs/core';

export const EmployeeStatus = Reflector.createDecorator<string[]>();