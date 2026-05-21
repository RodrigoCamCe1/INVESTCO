import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Meeting } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from './clients.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
  ) {}

  async create(clientId: string, dto: CreateMeetingDto): Promise<Meeting> {
    await this.clients.assertExists(clientId);
    if (dto.scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException('scheduledAt no puede ser en el pasado');
    }
    return this.prisma.meeting.create({
      data: {
        clientId,
        scheduledAt: dto.scheduledAt,
        durationMin: dto.durationMin,
        notes: dto.notes,
      },
    });
  }

  async list(clientId: string): Promise<Meeting[]> {
    await this.clients.assertExists(clientId);
    return this.prisma.meeting.findMany({
      where: { clientId },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async update(clientId: string, meetingId: string, dto: UpdateMeetingDto): Promise<Meeting> {
    const found = await this.prisma.meeting.findFirst({ where: { id: meetingId, clientId } });
    if (!found) throw new NotFoundException(`Meeting no encontrado: ${meetingId}`);
    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt }),
        ...(dto.durationMin !== undefined && { durationMin: dto.durationMin }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(clientId: string, meetingId: string): Promise<{ id: string }> {
    const found = await this.prisma.meeting.findFirst({ where: { id: meetingId, clientId } });
    if (!found) throw new NotFoundException(`Meeting no encontrado: ${meetingId}`);
    await this.prisma.meeting.delete({ where: { id: meetingId } });
    return { id: meetingId };
  }
}
