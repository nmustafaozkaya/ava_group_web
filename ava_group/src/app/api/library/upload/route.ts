import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type MediaType = "icons" | "images" | "videos";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    if (type !== "icons" && type !== "images" && type !== "videos") {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    const allowedTypes: Record<MediaType, string[]> = {
      icons: [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ],
      images: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      videos: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    };

    if (!allowedTypes[type].includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya tipi" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya çok büyük (max 10MB)" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", type);
    // Async mkdir kullanın
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Async writeFile kullanın
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      message: "Dosya başarıyla yüklendi",
      fileName,
      path: `/${type}/${fileName}`,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Yükleme hatası:", error);
    return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 500 });
  }
}
