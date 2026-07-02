import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string) {
    return this.prisma.userSettings.create({
      data: {
        userId,
        bucketCycleStart: new Date(),
      },
    });
  }

  async findByUserId(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await this.create(userId);
    }
    return settings;
  }

  async update(userId: string, dto: UpdateSettingsDto) {
    await this.findByUserId(userId);

    return this.prisma.userSettings.update({
      where: { userId },
      data: {
        ...dto,
        bucketCycleStart: dto.bucketCycleStart
          ? new Date(dto.bucketCycleStart)
          : undefined,
      },
    });
  }
}
