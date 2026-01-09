import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Node.js runtime'ı zorla - Bu çok önemli!
export const runtime = "nodejs";

// Dosya boyutu ve timeout limitleri
export const maxDuration = 60; // 60 saniye timeout

export async function POST(req: NextRequest) {
  try {
    // FormData'yı al
    const formData = await req.formData();

    // File ve folder verilerini al
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    // Validasyon
    if (!file || !folder) {
      return NextResponse.json(
        { message: "Dosya ve klasör bilgisi gerekli" },
        { status: 400 }
      );
    }

    // Folder validasyonu - videos klasörü eklendi
    if (folder !== "images" && folder !== "icons" && folder !== "videos") {
      return NextResponse.json(
        {
          message:
            "Geçersiz klasör. Sadece 'images', 'icons' veya 'videos' kullanın",
        },
        { status: 400 }
      );
    }

    // File validasyonu
    if (!file.name || file.size === 0) {
      return NextResponse.json({ message: "Geçersiz dosya" }, { status: 400 });
    }

    // Dosya tipi kontrolü
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    const allowedVideoTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
      "video/avi",
      "video/mov",
    ];

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          message: `Desteklenmeyen dosya tipi: ${
            file.type
          }. Desteklenen tipler: ${[
            ...allowedImageTypes,
            ...allowedVideoTypes,
          ].join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü - videolar için daha büyük limit
    let maxFileSize;
    if (isVideo) {
      maxFileSize = 100 * 1024 * 1024; // 100MB videolar için
    } else {
      maxFileSize = 10 * 1024 * 1024; // 10MB resimler için
    }

    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return NextResponse.json(
        {
          message: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz. Mevcut dosya: ${Math.round(
            file.size / (1024 * 1024)
          )}MB`,
        },
        { status: 400 }
      );
    }

    // Hedef dizini oluştur
    const uploadDir = path.join(process.cwd(), "public", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Dosya adını oluştur (güvenli)
    const fileExtension = path.extname(file.name).toLowerCase();
    const baseName = path
      .basename(file.name, fileExtension)
      .replace(/[^a-zA-Z0-9]/g, "_") // Özel karakterleri temizle
      .substring(0, 50); // Uzunluk sınırı

    const filename = `${Date.now()}_${baseName}${fileExtension}`;
    const finalPath = path.join(uploadDir, filename);

    // File'ı buffer'a çevir ve kaydet
    console.log(
      `Dosya yükleniyor: ${filename} (${Math.round(
        file.size / (1024 * 1024)
      )}MB)`
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosyayı kaydet
    fs.writeFileSync(finalPath, buffer);

    console.log(`Dosya başarıyla kaydedildi: ${finalPath}`);

    // URL'i döndür
    const fileUrl = `/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      fileSize: file.size,
      fileType: file.type,
      message: "Dosya başarıyla yüklendi",
    });
  } catch (error) {
    console.error("Upload hatası:", error);

    // Hata türüne göre daha detaylı mesaj
    let errorMessage = "Dosya yükleme sırasında hata oluştu";

    if (error instanceof Error) {
      if (
        error.message.includes("EMFILE") ||
        error.message.includes("ENFILE")
      ) {
        errorMessage = "Çok fazla dosya açık. Lütfen tekrar deneyin.";
      } else if (error.message.includes("ENOSPC")) {
        errorMessage = "Disk alanı yetersiz.";
      } else if (
        error.message.includes("EPERM") ||
        error.message.includes("EACCES")
      ) {
        errorMessage = "Dosya yazma izni yok.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : "Sunucu hatası",
      },
      { status: 500 }
    );
  }
}

// GET endpoint'i (opsiyonel)
export async function GET() {
  return NextResponse.json({
    message: "File upload endpoint'i. POST ile dosya yükleyin.",
    supportedTypes: {
      images: ["jpeg", "jpg", "png", "webp", "gif", "svg"],
      videos: ["mp4", "mpeg", "quicktime", "webm", "avi", "mov"],
    },
    maxSizes: {
      images: "10MB",
      videos: "100MB",
    },
  });
}
