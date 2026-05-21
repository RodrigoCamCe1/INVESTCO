import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StaffAssignment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { EndAssignmentDto } from './dto/end-assignment.dto';
import { WorkersService } from './workers.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly workers: WorkersService,
  ) {}

  async create(projectId: string, dto: CreateAssignmentDto): Promise<StaffAssignment> {
    await this.projects.assertExists(projectId);
    await this.workers.assertActive(dto.workerId);

    if (dto.endDate && dto.endDate.getTime() < dto.startDate.getTime()) {
      throw new BadRequestException('endDate debe ser >= startDate');
    }

    const overlapping = await this.prisma.staffAssignment.findFirst({
      where: {
        projectId,
        workerId: dto.workerId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: dto.startDate } },
        ],
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        `Worker ya tiene asignación activa en proyecto (assignment ${overlapping.id})`,
      );
    }

    return this.prisma.staffAssignment.create({
      data: {
        projectId,
        workerId: dto.workerId,
        role: dto.role,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });
  }

  async list(projectId: string) {
    await this.projects.assertExists(projectId);
    return this.prisma.staffAssignment.findMany({
      where: { projectId },
      include: { worker: { include: { user: { select: { fullName: true } } } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async end(projectId: string, assignmentId: string, dto: EndAssignmentDto): Promise<StaffAssignment> {
    const found = await this.prisma.staffAssignment.findFirst({
      where: { id: assignmentId, projectId },
    });
    if (!found) throw new NotFoundException(`Asignación no encontrada: ${assignmentId}`);
    if (!found.isActive) throw new BadRequestException('Asignación ya finalizada');

    const endDate = dto.endDate ?? new Date();
    if (endDate.getTime() < found.startDate.getTime()) {
      throw new BadRequestException('endDate debe ser >= startDate');
    }

    return this.prisma.staffAssignment.update({
      where: { id: assignmentId },
      data: { endDate, isActive: false },
    });
  }
}
