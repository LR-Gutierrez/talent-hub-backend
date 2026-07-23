import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(params: { pageIndex: number; pageSize: number; query: string; sortKey?: string; sortOrder?: string }) {
    const { pageIndex, pageSize, query, sortKey, sortOrder } = params;
    const where = query
      ? [
          { displayName: ILike(`%${query}%`) },
          { email: ILike(`%${query}%`) },
        ]
      : {};
    const order = sortKey && sortOrder ? { [sortKey]: sortOrder } : {};
    const [list, total] = await this.usersRepository.findAndCount({
      where,
      order,
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async create(dto: CreateUserDto) {
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async changePassword(id: string, password: string) {
    const user = await this.findOne(id);
    user.password = await bcrypt.hash(password, 10);
    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
