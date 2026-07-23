import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post()
  @RequireAbility('create', 'User')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'User')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('sortKey') sortKey?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.usersService.findAll({
      pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      query: query || '',
      sortKey,
      sortOrder,
    });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'User')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id')
  @RequireAbility('update', 'User')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Delete(':id')
  @RequireAbility('delete', 'User')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id/change-password')
  @RequireAbility('update', 'User')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(id, dto.password);
  }
}
