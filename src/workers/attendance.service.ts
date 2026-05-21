import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Attendance, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ListAttendanceQueryDto } from './dto/list-attendance.query';
import { WorkersService } from './workers.service';

export interface LaborCostRow {
  workerId: string;
  speciality: string;
  totalHours: number;
  totalDays: number;
  totalCost: number;
}

export interface LaborCostSummary {
  projectId: string;
  from?: Date;
  to?: Date;
  rows: LaborCostRow[];
  grandTotal: number;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly workers: WorkersService,
  ) {}

  async create(projectId: string, dto: CreateAttendanceDto): Promise<Attendance> {
    await this.projects.assertExists(projectId);
    const worker = await this.workers.assertActive(dto.workerId);

    const assignment = await this.prisma.staffAssignment.findFirst({
      where: { projectId, workerId: dto.workerId, isActive: true },
    });
    if (!assignment) {
      throw new BadRequestException('Worker no tiene asignación activa en este proyecto');
    }
    if (dto.date.getTime() < assignment.startDate.getTime()) {
      throw new BadRequestException('Fecha previa a inicio de asignación');
    }

    try {
      return await this.prisma.attendance.create({
        data: {
          projectId,
          workerId: dto.workerId,
          date: dto.date,
          hoursWorked: new Prisma.Decimal(dto.hoursWorked),
          status: dto.status ?? 'PRESENTE',
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(
          `Ya existe asistencia para worker ${worker.id} en fecha ${dto.date.toISOString().slice(0, 10)}`,
        );
      }
      throw e;
    }
  }

  async list(projectId: string, q: ListAttendanceQueryDto) {
    await this.projects.assertExists(projectId);
    return this.prisma.attendance.findMany({
      where: {
        projectId,
        ...(q.workerId && { workerId: q.workerId }),
        ...(q.from || q.to
          ? {
              date: {
                ...(q.from && { gte: q.from }),
                ...(q.to && { lte: q.to }),
              },
            }
          : {}),
      },
      include: { worker: { include: { user: { select: { fullName: true } } } } },
      orderBy: { date: 'desc' },
    });
  }

  async laborCost(projectId: string, q: ListAttendanceQueryDto): Promise<LaborCostSummary> {
    await this.projects.assertExists(projectId);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        projectId,
        status: 'PRESENTE',
        ...(q.workerId && { workerId: q.workerId }),
        ...(q.from || q.to
          ? {
              date: {
                ...(q.from && { gte: q.from }),
                ...(q.to && { lte: q.to }),
              },
            }
          : {}),
      },
      include: { worker: true },
    });

    const byWorker = new Map<string, { speciality: string; hours: number; days: number; cost: number }>();
    for (const a of attendances) {
      const w = a.worker;
      const key = w.id;
      const hours = Number(a.hoursWorked);
      const hourly = w.hourlyRate ? Number(w.hourlyRate) : null;
      const daily = w.dailyRate ? Number(w.dailyRate) : null;
      const cost = hourly !== null ? hourly * hours : daily !== null ? daily : 0;

      const existing = byWorker.get(key) ?? { speciality: w.speciality, hours: 0, days: 0, cost: 0 };
      existing.hours += hours;
      existing.days += 1;
      existing.cost += cost;
      byWorker.set(key, existing);
    }

    const rows: LaborCostRow[] = [...byWorker.entries()].map(([workerId, v]) => ({
      workerId,
      speciality: v.speciality,
      totalHours: Math.round(v.hours * 100) / 100,
      totalDays: v.days,
      totalCost: Math.round(v.cost * 100) / 100,
    }));

    const grandTotal = Math.round(rows.reduce((acc, r) => acc + r.totalCost, 0) * 100) / 100;
    return { projectId, from: q.from, to: q.to, rows, grandTotal };
  }
}
