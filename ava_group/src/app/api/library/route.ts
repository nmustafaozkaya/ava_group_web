// src/app/api/library/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const iconsPath = path.join(process.cwd(), "public", "icons");
    const imagesPath = path.join(process.cwd(), "public", "images");
    const videosPath = path.join(process.cwd(), "public", "videos");

    // İkon dosyalarını al
    const iconFiles = fs.existsSync(iconsPath)
      ? fs
          .readdirSync(iconsPath)
          .filter((file) => /\.(png|jpe?g|webp|gif|svg)$/i.test(file))
      : [];

    // Resim dosyalarını al
    const imageFiles = fs.existsSync(imagesPath)
      ? fs
          .readdirSync(imagesPath)
          .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
      : [];

    // Video dosyalarını al
    const videoFiles = fs.existsSync(videosPath)
      ? fs
          .readdirSync(videosPath)
          .filter((file) => /\.(mp4|webm|ogg|mov)$/i.test(file))
      : [];

    const icons = iconFiles.map((file) => `/icons/${file}`);
    const images = imageFiles.map((file) => `/images/${file}`);
    const videos = videoFiles.map((file) => `/videos/${file}`);

    return NextResponse.json({ icons, images, videos });
  } catch (error) {
    console.error("Kütüphane hatası:", error);
    return NextResponse.json(
      { error: "Klasörler okunamadı." },
      { status: 500 }
    );
  }
}
