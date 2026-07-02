import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { name: dto.name, userId },
    });
    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        color: dto.color,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);

    if (dto.name) {
      const dup = await this.prisma.category.findFirst({
        where: { name: dto.name, userId, id: { not: id } },
      });
      if (dup) {
        throw new ConflictException('A category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.category.delete({ where: { id } });
  }
}
