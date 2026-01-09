// src/app/api/library/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function DELETE(request: NextRequest) {
  try {
    const { fileName, type } = await request.json();

    if (!fileName || !type) {
      return NextResponse.json(
        { error: "Dosya adı ve tip gerekli" },
        { status: 400 }
      );
    }

    if (!["icons", "images", "videos"].includes(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    // Burada uploads klasörünü kaldırdım, doğrudan public/{type}
    const filePath = path.join(process.cwd(), "public", type, fileName);

    // Güvenlik kontrolü
    const allowedDir = path.join(process.cwd(), "public", type);
    const resolvedPath = path.resolve(filePath);
    const resolvedAllowedDir = path.resolve(allowedDir);

    if (!resolvedPath.startsWith(resolvedAllowedDir)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Dosya var mı kontrolü
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    // Dosyayı sil
    await fs.unlink(filePath);

    return NextResponse.json({
      message: "Dosya başarıyla silindi",
      fileName,
    });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ error: "Dosya silinemedi" }, { status: 500 });
  }
}
