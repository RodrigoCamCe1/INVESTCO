import { Injectable, NotFoundException } from '@nestjs/common';
import { BudgetCategory, BudgetLine, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateBudgetLineDto } from './dto/create-budget-line.dto';
import { UpdateBudgetLineDto } from './dto/update-budget-line.dto';

export interface BudgetSummaryRow {
  category: BudgetCategory;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'OK' | 'OVERBUDGET' | 'UNDERBUDGET';
}

export interface BudgetSummary {
  projectId: string;
  lines: BudgetLine[];
  byCategory: BudgetSummaryRow[];
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercent: number;
}

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateBudgetLineDto): Promise<BudgetLine> {
    await this.projects.assertExists(projectId);
    return this.prisma.budgetLine.create({
      data: {
        projectId,
        category: dto.category,
        description: dto.description,
        plannedAmount: new Prisma.Decimal(dto.plannedAmount),
        actualAmount: new Prisma.Decimal(dto.actualAmount ?? 0),
      },
    });
  }

  async list(projectId: string): Promise<BudgetLine[]> {
    await this.projects.assertExists(projectId);
    return this.prisma.budgetLine.findMany({
      where: { projectId },
      orderBy: [{ category: 'asc' }, { description: 'asc' }],
    });
  }

  async update(projectId: string, id: string, dto: UpdateBudgetLineDto): Promise<BudgetLine> {
    const found = await this.prisma.budgetLine.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`BudgetLine no encontrada: ${id}`);
    return this.prisma.budgetLine.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.plannedAmount !== undefined && { plannedAmount: new Prisma.Decimal(dto.plannedAmount) }),
        ...(dto.actualAmount !== undefined && { actualAmount: new Prisma.Decimal(dto.actualAmount) }),
      },
    });
  }

  async remove(projectId: string, id: string): Promise<{ id: string }> {
    const found = await this.prisma.budgetLine.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`BudgetLine no encontrada: ${id}`);
    await this.prisma.budgetLine.delete({ where: { id } });
    return { id };
  }

  async summary(projectId: string): Promise<BudgetSummary> {
    await this.projects.assertExists(projectId);
    const lines = await this.prisma.budgetLine.findMany({
      where: { projectId },
      orderBy: { category: 'asc' },
    });

    const categories: BudgetCategory[] = ['MATERIAL', 'MANO_OBRA', 'EQUIPO', 'SUBCONTRATO', 'GENERAL'];
    const byCategory: BudgetSummaryRow[] = categories.map((c) => {
      const inCat = lines.filter((l) => l.category === c);
      const planned = inCat.reduce((acc, l) => acc + Number(l.plannedAmount), 0);
      const actual = inCat.reduce((acc, l) => acc + Number(l.actualAmount), 0);
      const variance = actual - planned;
      const variancePercent = planned === 0 ? 0 : Math.round((variance / planned) * 10000) / 100;
      return {
        category: c,
        planned: Math.round(planned * 100) / 100,
        actual: Math.round(actual * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        variancePercent,
        status: variance > 0 ? 'OVERBUDGET' : variance < 0 ? 'UNDERBUDGET' : 'OK',
      };
    });

    const totalPlanned = byCategory.reduce((acc, r) => acc + r.planned, 0);
    const totalActual = byCategory.reduce((acc, r) => acc + r.actual, 0);
    const totalVariance = totalActual - totalPlanned;
    const totalVariancePercent =
      totalPlanned === 0 ? 0 : Math.round((totalVariance / totalPlanned) * 10000) / 100;

    return {
      projectId,
      lines,
      byCategory: byCategory.filter((r) => r.planned > 0 || r.actual > 0),
      totalPlanned: Math.round(totalPlanned * 100) / 100,
      totalActual: Math.round(totalActual * 100) / 100,
      totalVariance: Math.round(totalVariance * 100) / 100,
      totalVariancePercent,
    };
  }
}
