import { applyDecorators, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../auth/local-auth.guard';

export function LocalAuth() {
  return applyDecorators(UseGuards(LocalAuthGuard));
}