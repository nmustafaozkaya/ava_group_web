import { PrismaClient, DetailType } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Detail verileri için type tanımı
type DetailInput = {
  type: DetailType;
  content?: string;
  content_tr?: string;
  content_en?: string;
  content_ar?: string;
  title_en?: string;
  title_tr?: string;
  title_ar?: string;
  order?: number;
};

// GET: Tüm projeleri detaylarıyla birlikte getir
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { details: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Veriler alınamadı", detail: error },
      { status: 500 }
    );
  }
}

// POST: Yeni proje ve ilişkili detayları oluştur
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Temel zorunlu alan kontrolü
    if (!data.src || !data.alt || !data.year) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik" },
        { status: 400 }
      );
    }

    const created = await prisma.project.create({
      data: {
        src: data.src,
        alt: data.alt,
        status: data.status || "IN_DESIGN",
        year: Number(data.year),
        leftTitle_en: data.leftTitle_en || "",
        leftTitle_tr: data.leftTitle_tr || "",
        leftTitle_ar: data.leftTitle_ar || null,
        description_en: data.description_en || "",
        description_tr: data.description_tr || "",
        description_ar: data.description_ar || null,
        location_en: data.location_en || "",
        location_tr: data.location_tr || "",
        location_ar: data.location_ar || null,
        client_en: data.client_en || "",
        client_tr: data.client_tr || "",
        client_ar: data.client_ar || null,
        typology_en: data.typology_en || "",
        typology_tr: data.typology_tr || "",
        typology_ar: data.typology_ar || null,
        icon: data.icon || null,
        details: {
          create: (data.details as DetailInput[])?.map((detail) => ({
            type: detail.type,
            content: detail.content ?? "", // null yerine boş string
            content_tr: detail.content_tr ?? null,
            content_en: detail.content_en ?? null,
            content_ar: detail.content_ar ?? null,
            title_en: detail.title_en ?? null,
            title_tr: detail.title_tr ?? null,
            title_ar: detail.title_ar ?? null,
            order: detail.order ?? 0,
          })),
        },
      },
      include: { details: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Proje eklenemedi", detail: `${error}` },
      { status: 500 }
    );
  }
}
