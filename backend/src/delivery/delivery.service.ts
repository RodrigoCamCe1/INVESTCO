import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientStatus, Delivery, ProjectStage, ProjectStatus, PropertyStatus } from '@prisma/client';
import { assertClientTransition } from '../clients/client-status.machine';
import { PrismaService } from '../prisma/prisma.service';
import { assertPropertyTransition } from '../properties/property-status.machine';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateDeliveryDto): Promise<Delivery> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId, deletedAt: null },
      });
      if (!project) throw new NotFoundException(`Proyecto no encontrado: ${projectId}`);
      if (project.status !== ProjectStatus.FINALIZADO) {
        throw new BadRequestException(
          `Solo proyectos FINALIZADO permiten entrega. Estado: ${project.status}`,
        );
      }

      const existing = await tx.delivery.findUnique({ where: { projectId } });
      if (existing) throw new ConflictException(`Ya existe delivery para este proyecto: ${existing.id}`);

      return tx.delivery.create({
        data: {
          projectId,
          deliveryDate: dto.deliveryDate,
          warrantyMonths: dto.warrantyMonths ?? 12,
          notes: dto.notes,
        },
      });
    });
  }

  async find(projectId: string): Promise<Delivery> {
    const found = await this.prisma.delivery.findUnique({
      where: { projectId },
      include: { project: { include: { property: true, contract: { include: { client: true } } } } },
    });
    if (!found) throw new NotFoundException(`Delivery no encontrada para proyecto: ${projectId}`);
    return found;
  }

  async signClient(projectId: string): Promise<Delivery> {
    return this.applySignature(projectId, 'client');
  }

  async signCompany(projectId: string): Promise<Delivery> {
    return this.applySignature(projectId, 'company');
  }

  private async applySignature(projectId: string, side: 'client' | 'company'): Promise<Delivery> {
    return this.prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({ where: { projectId } });
      if (!delivery) throw new NotFoundException(`Delivery no encontrada: ${projectId}`);

      const alreadySigned = side === 'client' ? delivery.signedByClient : delivery.signedByCompany;
      if (alreadySigned) {
        throw new BadRequestException(`Ya firmado por ${side}`);
      }

      const updated = await tx.delivery.update({
        where: { projectId },
        data:
          side === 'client'
            ? { signedByClient: true }
            : { signedByCompany: true },
      });

      if (updated.signedByClient && updated.signedByCompany) {
        const project = await tx.project.findUniqueOrThrow({
          where: { id: projectId },
          include: { property: true, contract: { include: { client: true } } },
        });

        if (project.property.status !== PropertyStatus.ENTREGADO) {
          assertPropertyTransition(project.property.status, PropertyStatus.ENTREGADO);
          await tx.property.update({
            where: { id: project.propertyId },
            data: { status: PropertyStatus.ENTREGADO },
          });
        }

        const client = project.contract.client;
        if (client.status !== ClientStatus.ENTREGADO) {
          assertClientTransition(client.status, ClientStatus.ENTREGADO);
          await tx.client.update({
            where: { id: client.id },
            data: { status: ClientStatus.ENTREGADO },
          });
        }

        if (project.currentStage !== ProjectStage.ENTREGA) {
          await tx.project.update({
            where: { id: projectId },
            data: { currentStage: ProjectStage.ENTREGA },
          });
        }
      }

      return updated;
    });
  }
}
