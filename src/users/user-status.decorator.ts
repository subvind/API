import { Reflector } from '@nestjs/core';

export const UserStatus = Reflector.createDecorator<string[]>();