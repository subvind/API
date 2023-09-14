import { Reflector } from '@nestjs/core';

export const AuthStatus = Reflector.createDecorator<string[]>();