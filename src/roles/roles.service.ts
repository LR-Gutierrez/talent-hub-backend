import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,
  ) {}

  async findAll() {
    const list = await this.rolesRepo.find({ relations: { permissions: true } });
    return { list };
  }

  async findByName(name: string) {
    return this.rolesRepo.findOne({
      where: { name },
      relations: { permissions: true },
    });
  }

  async findOne(id: string) {
    const role = await this.rolesRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const permissions = dto.permissionIds?.length
      ? await this.permissionsRepo.findBy({ id: In(dto.permissionIds) })
      : [];
    const role = this.rolesRepo.create({
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem ?? false,
      permissions,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new ForbiddenException('Cannot rename system role');
    }
    if (dto.permissionIds) {
      role.permissions = dto.permissionIds.length
        ? await this.permissionsRepo.findBy({ id: In(dto.permissionIds) })
        : [];
    }
    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    return this.rolesRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system role');
    }
    await this.rolesRepo.remove(role);
  }
}
