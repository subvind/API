import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { GuestService } from './guest.service';
import { Guest } from './guest.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('guests')
@Controller('guests')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Get all guests' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  @AuthStatus(['Webmaster'])
  @UseGuards(AuthStatusGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.guestService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a guest by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  @AuthStatus(['Webmaster'])
  @UseGuards(AuthStatusGuard)
  async findOne(@Param('id') id: string): Promise<Guest> {
    return this.guestService.findOne(id);
  }

  @ApiOperation({ summary: 'Welcome a guest by ip address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('ipAddress/:ipAddress/:organizationId')
  async welcome(
    @Req() req: Request,
    @Param('ipAddress') ipAddress: string,
    @Param('organizationId') organizationId: string,
  ): Promise<any> {

    let guest = await this.guestService.findByIpAddress(ipAddress, organizationId);

    if (!guest) {
      let value: any = {
        ipAddress: ipAddress,
        headers: JSON.stringify(req.headers)
      }
      guest = await this.guestService.create(value)
    }

    // Generate and return a JWT token
    const auth: any = { 
      sub: guest.id, 
      ipAddress: guest.ipAddress,
      type: 'guest'
    };
    
    return this.jwtService.sign(auth, {
      secret: process.env.JWT_SECRET
    });
  }

  @ApiOperation({ summary: 'Create a guest' })
  @ApiBody({ type: Guest })
  @ApiResponse({ status: 201, description: 'Success', type: Guest })
  @Post()
  // @UseGuards() // anyone can create a guest
  async create(  
    @Body() guestData: Guest
  ): Promise<Guest> {
    return this.guestService.create(guestData);
  }

  @ApiOperation({ summary: 'Update a guest' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Webmaster'])
  @UseGuards(AuthStatusGuard)
  async update(@Param('id') id: string, @Body() updatedGuestData: Guest): Promise<Guest> {
    return this.guestService.update(id, updatedGuestData);
  }

  @ApiOperation({ summary: 'Delete a guest' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Webmaster'])
  @UseGuards(AuthStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.guestService.remove(id);
  }
}
