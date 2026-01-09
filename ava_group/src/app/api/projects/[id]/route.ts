import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client"; // <-- bunu ekle

interface Params {
  params: {
    id: string;
  };
}

interface DetailInput {
  id?: number;
  type: "image" | "text" | "video";
  content: string;
  content_tr?: string | null;
  content_en?: string | null;
  content_ar?: string | null;
  title_en?: string | null;
  title_tr?: string | null;
  title_ar?: string | null;
  order?: number;
}

export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { details: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Database error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const data = await request.json();

    if (!data.src || !data.alt || !data.year) {
      return NextResponse.json(
        { error: "Required fields missing (src, alt, year)" },
        { status: 400 }
      );
    }

    const details: DetailInput[] = data.details || [];

    await prisma.$transaction(async (tx) => {
      // Proje alanlarını güncelle
      await tx.project.update({
        where: { id },
        data: {
          src: data.src,
          alt: data.alt,
          status: data.status,
          icon: data.icon || null,
          year: data.year,
          leftTitle_en: data.leftTitle_en,
          leftTitle_tr: data.leftTitle_tr,
          leftTitle_ar: data.leftTitle_ar || null,
          description_en: data.description_en,
          description_tr: data.description_tr,
          description_ar: data.description_ar || null,
          location_en: data.location_en,
          location_tr: data.location_tr,
          location_ar: data.location_ar || null,
          client_en: data.client_en,
          client_tr: data.client_tr,
          client_ar: data.client_ar || null,
          typology_en: data.typology_en,
          typology_tr: data.typology_tr,
          typology_ar: data.typology_ar || null,
        },
      });

      // Mevcut detayları getir
      const existingDetails = await tx.projectDetail.findMany({
        where: { projectId: id },
        select: { id: true },
      });

      const detailIdsFromReq = details.filter((d) => d.id).map((d) => d.id!);

      // Verilen detaylarda olmayanları sil
      const toDelete = existingDetails
        .filter((d) => !detailIdsFromReq.includes(d.id))
        .map((d) => d.id);

      if (toDelete.length > 0) {
        await tx.projectDetail.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // Detayları güncelle veya yeni ekle
      for (const detail of details) {
        if (detail.id) {
          await tx.projectDetail.update({
            where: { id: detail.id },
            data: {
              type: detail.type,
              content: detail.content ?? null,
              content_tr: detail.content_tr ?? null,
              content_en: detail.content_en ?? null,
              content_ar: detail.content_ar ?? null,
              title_en: detail.title_en ?? null,
              title_tr: detail.title_tr ?? null,
              title_ar: detail.title_ar ?? null,
              order: detail.order ?? 0,
            } as Prisma.ProjectDetailUncheckedUpdateInput,
          });
        } else {
          await tx.projectDetail.create({
            data: {
              projectId: id,
              type: detail.type,
              content: detail.content ?? null,
              content_tr: detail.content_tr ?? null,
              content_en: detail.content_en ?? null,
              content_ar: detail.content_ar ?? null,
              title_en: detail.title_en ?? null,
              title_tr: detail.title_tr ?? null,
              title_ar: detail.title_ar ?? null,
              order: detail.order ?? 0,
            } as Prisma.ProjectDetailUncheckedCreateInput,
          });
        }
      }
    });

    const fullUpdatedProject = await prisma.project.findUnique({
      where: { id },
      include: { details: true },
    });

    return NextResponse.json(fullUpdatedProject);
  } catch (error) {
    return NextResponse.json(
      { error: "Update failed", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Delete failed", detail: String(error) },
      { status: 500 }
    );
  }
}
