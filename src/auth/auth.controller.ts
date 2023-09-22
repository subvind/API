import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalUserAuthGuard } from './local-user-auth.guard';
import { LocalAccountAuthGuard } from './local-account-auth.guard';
import { AuthService } from './auth.service';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Auth user via JWT' })
  @ApiResponse({ status: 200, description: 'Success' })
  @UseGuards(LocalUserAuthGuard)
  @Post('userLogin')
  async userLogin(@Request() req) {
    return this.authService.userLogin(req.user);
  }

  @ApiOperation({ summary: 'Auth account via JWT' })
  @ApiResponse({ status: 200, description: 'Success' })
  @UseGuards(LocalAccountAuthGuard)
  @Post('accountLogin')
  async accountLogin(@Request() req) {
    return this.authService.accountLogin(req.account);
  }
}
