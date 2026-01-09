"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

type DetailType = "image" | "text" | "video" | "location";

type ProjectDetail = {
  id?: number;
  type: DetailType;
  content_tr?: string;
  content_en?: string;
  content_ar?: string;
  content?: string;
  title_en?: string;
  title_tr?: string;
  title_ar?: string;
  order: number;
};

type ProjectStatus = "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN";

type Project = {
  id?: number;
  src: string;
  alt: string;
  status: ProjectStatus;
  year: number;
  icon?: string;

  // Çok dilli başlıklar
  leftTitle_en: string;
  leftTitle_tr: string;
  leftTitle_ar?: string;

  // Çok dilli açıklamalar
  description_en: string;
  description_tr: string;
  description_ar?: string;

  // Çok dilli konumlar
  location_en: string;
  location_tr: string;
  location_ar?: string;

  // Çok dilli müşteriler
  client_en: string;
  client_tr: string;
  client_ar?: string;

  // Çok dilli tipolojiler
  typology_en: string;
  typology_tr: string;
  typology_ar?: string;

  // Proje detayları
  details: ProjectDetail[];
};

type MediaResponse = {
  icons: string[];
  images: string[];
  videos: string[];
};

function convertToEmbedUrl(url: string): string {
  if (url.includes("embed")) {
    return url;
  }

  if (url.includes("maps.app.goo.gl") || url.includes("goo.gl")) {
    console.warn(
      "Shortened Google Maps URLs cannot be embedded. Please use the embed URL instead."
    );
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.8043647160544!2d37.3662!3d37.0642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA0JzAzLjEiTiAzN8KwMjEnNTguMyJF!5e0!3m2!1sen!2str!4v1234567890123!5m2!1sen!2str";
  }

  if (url.includes("google.com/maps")) {
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.8043647160544!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA0JzAzLjEiTiAzN8KwMjEnNTguMyJF!5e0!3m2!1sen!2str!4v1234567890123!5m2!1sen!2str`;
    }
  }

  return url;
}

// Medya Kütüphanesi Bileşeni - Light Mode Fixed
function MediaLibraryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [library, setLibrary] = useState<MediaResponse | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"icons" | "images" | "videos">(
    "images"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
    }
  }, [isOpen]);

  const loadLibrary = async () => {
    try {
      const res = await fetch("/api/library");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setLibrary(data);
      setError("");
    } catch (err) {
      console.error("Kütüphane API hatası:", err);
      setError("Kütüphane yüklenirken hata oluştu");
      // Fallback için boş data set et
      setLibrary({
        icons: [],
        images: [],
        videos: [],
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const totalFiles = files.length;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Dosya boyutu kontrolü (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setError(
            (prev) => prev + `${file.name} dosyası çok büyük (max 10MB). `
          );
          failCount++;
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", activeTab);

        try {
          const response = await fetch("/api/library/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`${file.name} yüklenemedi:`, errorData);
            setError((prev) => prev + `${file.name} yüklenemedi. `);
            failCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error("Yükleme hatası:", error);
          setError((prev) => prev + `${file.name} yüklenirken hata oluştu. `);
          failCount++;
        }

        // Progress güncellemesi
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // Sonuç mesajı
      if (successCount > 0) {
        await loadLibrary();
      }

      if (successCount > 0 && failCount === 0) {
        setError("");
        alert(`${successCount} dosya başarıyla yüklendi!`);
      } else if (successCount > 0 && failCount > 0) {
        alert(`${successCount} dosya yüklendi, ${failCount} dosya başarısız.`);
      } else if (failCount > 0) {
        alert("Hiçbir dosya yüklenemedi.");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleDelete = async (fileName: string, type: string) => {
    if (!confirm(`${fileName} dosyasını silmek istediğinizden emin misiniz?`))
      return;

    try {
      const response = await fetch("/api/library/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, type }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Silme hatası:", errorData);
        setError(`Dosya silinemedi: ${response.statusText}`);
        return;
      }

      await loadLibrary();
      // Seçili dosyayı temizle
      if (type === "icons") setSelectedIcon(null);
      if (type === "images") setSelectedImage(null);
      if (type === "videos") setSelectedVideo(null);
      setError("");

      alert("Dosya başarıyla silindi!");
    } catch (error) {
      console.error("Silme hatası:", error);
      setError("Dosya silinirken hata oluştu");
    }
  };

  const getFileName = (path: string) => path.split("/").pop() || "";

  const getAcceptedTypes = () => {
    switch (activeTab) {
      case "icons":
        return ".png,.jpg,.jpeg,.webp,.gif,.svg";
      case "images":
        return ".png,.jpg,.jpeg,.webp,.gif";
      case "videos":
        return ".mp4,.webm,.ogg,.mov";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ colorScheme: "light" }} // Force light mode
    >
      <div
        className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4"
        style={{
          backgroundColor: "#ffffff",
          color: "#1f2937",
        }}
      >
        {/* Başlık ve Kapat */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Medya Kütüphanesi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {library && (
          <div>
            {/* Tab Navigation */}
            <div className="flex mb-6 pb-1">
              {[
                {
                  key: "images" as const,
                  label: "Resimler",
                  count: library.images?.length || 0,
                },
                {
                  key: "icons" as const,
                  label: "İkonlar",
                  count: library.icons?.length || 0,
                },
                {
                  key: "videos" as const,
                  label: "Videolar",
                  count: library.videos?.length || 0,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "0.5rem 1rem",
                    marginRight: "0.5rem",
                    borderBottom: "2px solid",
                    borderBottomColor:
                      activeTab === tab.key ? "#2563eb" : "transparent",
                    backgroundColor:
                      activeTab === tab.key ? "#2563eb" : "#e5e7eb",
                    color: activeTab === tab.key ? "#fff" : "#374151",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Upload Section */}
            <div
              className="mb-6 p-4 rounded-lg"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <div
                className="mb-3 p-3 border rounded text-xs"
                style={{
                  backgroundColor: "#eff6ff",
                  borderColor: "#bfdbfe",
                }}
              >
                <p className="font-medium mb-1" style={{ color: "#1e40af" }}>
                  {activeTab === "images"
                    ? "Resim"
                    : activeTab === "icons"
                    ? "İkon"
                    : "Video"}{" "}
                  Gereksinimleri:
                </p>
                <ul className="space-y-1" style={{ color: "#1d4ed8" }}>
                  {activeTab === "images" ? (
                    <>
                      <li>
                        • <strong>Format:</strong> PNG, JPG, JPEG, WebP, GIF
                      </li>
                      <li>
                        • <strong>Boyut:</strong> Minimum 800x600px
                      </li>
                      <li>
                        • <strong>Dosya boyutu:</strong> Maksimum 10MB
                      </li>
                    </>
                  ) : activeTab === "icons" ? (
                    <>
                      <li>
                        • <strong>Format:</strong> PNG, JPG, JPEG, WebP, GIF,
                        SVG
                      </li>
                      <li>
                        • <strong>Boyut:</strong> 64x64px - 256x256px (kare
                        format)
                      </li>
                      <li>
                        • <strong>Dosya boyutu:</strong> Maksimum 10MB
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        • <strong>Format:</strong> MP4, WebM, OGG, MOV
                      </li>
                      <li>
                        • <strong>Çözünürlük:</strong> Minimum 720p
                      </li>
                      <li>
                        • <strong>Dosya boyutu:</strong> Maksimum 100MB
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  multiple
                  accept={getAcceptedTypes()}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="library-file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="library-file-upload"
                  className={`px-6 py-3 rounded-lg cursor-pointer font-medium transition-colors ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                  }}
                >
                  {uploading
                    ? "Yükleniyor..."
                    : `${
                        activeTab === "images"
                          ? "Resim"
                          : activeTab === "icons"
                          ? "İkon"
                          : "Video"
                      } Yükle`}
                </label>

                <button
                  onClick={() => {
                    if (activeTab === "images" && selectedImage)
                      handleDelete(getFileName(selectedImage), "images");
                    else if (activeTab === "icons" && selectedIcon)
                      handleDelete(getFileName(selectedIcon), "icons");
                    else if (activeTab === "videos" && selectedVideo)
                      handleDelete(getFileName(selectedVideo), "videos");
                    else alert("Lütfen önce bir dosya seçin!");
                  }}
                  disabled={
                    (activeTab === "images" && !selectedImage) ||
                    (activeTab === "icons" && !selectedIcon) ||
                    (activeTab === "videos" && !selectedVideo)
                  }
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor:
                      (activeTab === "images" && !selectedImage) ||
                      (activeTab === "icons" && !selectedIcon) ||
                      (activeTab === "videos" && !selectedVideo)
                        ? "#ef444450"
                        : "#ef4444",
                    borderRadius: "0.5rem",
                    cursor:
                      (activeTab === "images" && !selectedImage) ||
                      (activeTab === "icons" && !selectedIcon) ||
                      (activeTab === "videos" && !selectedVideo)
                        ? "not-allowed"
                        : "pointer",
                    color: "#ffffff",
                    fontWeight: 500,
                    transition: "background-color 0.3s ease",
                    border: "none",
                  }}
                >
                  Seçili{" "}
                  {activeTab === "images"
                    ? "Resmi"
                    : activeTab === "icons"
                    ? "İkonu"
                    : "Videoyu"}{" "}
                  Sil
                </button>

                {uploading && (
                  <div className="flex-1">
                    <div
                      className="w-full rounded-full h-3"
                      style={{ backgroundColor: "#e5e7eb" }}
                    >
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                          backgroundColor: "#2563eb",
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-sm mt-1 block"
                      style={{ color: "#6b7280" }}
                    >
                      {Math.round(uploadProgress)}% tamamlandı
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm mt-2" style={{ color: "#6b7280" }}>
                Desteklenen formatlar:{" "}
                {getAcceptedTypes().replace(/\./g, "").toUpperCase()}
              </p>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeTab === "icons" &&
                (library.icons || []).map((icon, index) => (
                  <div key={`${icon}-${index}`} className="relative group">
                    <div
                      className={`flex justify-center items-center p-2 rounded-lg cursor-pointer border-2 transition-all relative`}
                      style={{
                        borderColor:
                          selectedIcon === icon ? "#3b82f6" : "#e5e7eb", // Gri border default
                        backgroundColor:
                          selectedIcon === icon ? "#eff6ff" : "transparent", // Açık mavi background
                      }}
                      onClick={() =>
                        setSelectedIcon(selectedIcon === icon ? null : icon)
                      }
                      onMouseEnter={(e) => {
                        if (selectedIcon !== icon) {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedIcon !== icon) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }
                      }}
                    >
                      <Image
                        src={icon.startsWith("/") ? icon : `/icons/${icon}`}
                        alt="İkon"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                      {selectedIcon === icon && (
                        <div
                          className="absolute inset-0 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                        >
                          <div
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#3b82f6" }}
                          >
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 truncate text-center"
                      style={{ color: "#6b7280" }}
                      title={getFileName(icon)}
                    >
                      {getFileName(icon)}
                    </p>
                  </div>
                ))}

              {activeTab === "images" &&
                (library.images || []).map((image, index) => (
                  <div key={`${image}-${index}`} className="relative group">
                    <div
                      className={`overflow-hidden rounded-lg transition-all border-2 cursor-pointer`}
                      style={{
                        borderColor:
                          selectedImage === image ? "#10b981" : "transparent",
                      }}
                      onClick={() =>
                        setSelectedImage(selectedImage === image ? null : image)
                      }
                      onMouseEnter={(e) => {
                        if (selectedImage !== image) {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedImage !== image) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <Image
                        src={image || "/icons/fallback.svg"}
                        alt="Resim"
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {selectedImage === image && (
                        <div className="absolute inset-0"></div>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 truncate text-center"
                      style={{ color: "#6b7280" }}
                      title={getFileName(image)}
                    >
                      {getFileName(image)}
                    </p>
                  </div>
                ))}

              {activeTab === "videos" &&
                (library.videos || []).map((video, index) => (
                  <div key={`${video}-${index}`} className="relative group">
                    <div
                      className={`overflow-hidden rounded-lg transition-all border-2 cursor-pointer`}
                      style={{
                        borderColor:
                          selectedVideo === video ? "#8b5cf6" : "transparent",
                      }}
                      onClick={() =>
                        setSelectedVideo(selectedVideo === video ? null : video)
                      }
                      onMouseEnter={(e) => {
                        if (selectedVideo !== video) {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedVideo !== video) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <video
                        src={video}
                        className="w-full h-32 object-cover"
                        muted
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                        </div>
                      </div>
                      {selectedVideo === video && (
                        <div className="absolute inset-0"></div>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 truncate text-center"
                      style={{ color: "#6b7280" }}
                      title={getFileName(video)}
                    >
                      {getFileName(video)}
                    </p>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {((activeTab === "icons" && (library.icons?.length || 0) === 0) ||
              (activeTab === "images" && (library.images?.length || 0) === 0) ||
              (activeTab === "videos" &&
                (library.videos?.length || 0) === 0)) && (
              <div className="text-center py-12" style={{ color: "#6b7280" }}>
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg font-medium mb-2">
                  Henüz{" "}
                  {activeTab === "images"
                    ? "resim"
                    : activeTab === "icons"
                    ? "ikon"
                    : "video"}{" "}
                  yüklenmemiş
                </p>
                <p className="text-sm">
                  Dosya yüklemek için yukarıdaki butonu kullanın
                </p>
              </div>
            )}

            {/* İstatistikler */}
            {library &&
              (library.images?.length > 0 ||
                library.icons?.length > 0 ||
                library.videos?.length > 0) && (
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  <h4
                    className="text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Kütüphane İstatistikleri
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#2563eb" }}
                      >
                        {library.images?.length || 0}
                      </div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>
                        Resim
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        {library.icons?.length || 0}
                      </div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>
                        İkon
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#9333ea" }}
                      >
                        {library.videos?.length || 0}
                      </div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>
                        Video
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Loading State */}
        {!library && !error && (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
              style={{ borderColor: "#2563eb" }}
            ></div>
            <p style={{ color: "#6b7280" }}>Kütüphane yükleniyor...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            className="mb-4 p-3 rounded font-semibold"
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function MediaModal({
  isOpen,
  onClose,
  onSelect,
  type = "images",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  type?: "images" | "icons" | "videos";
}) {
  const [library, setLibrary] = useState<MediaResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
    }
  }, [isOpen, type]);

  const loadLibrary = async () => {
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      setLibrary(data);
    } catch (err) {
      console.error("Kütüphane API hatası:", err);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      try {
        await fetch("/api/library/upload", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error("Yükleme hatası:", error);
      }
    }

    await loadLibrary();
    event.target.value = "";
  };

  const handleItemClick = (item: string) => {
    onSelect(item);
    onClose();
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case "icons":
        return ".png,.jpg,.jpeg,.webp,.gif,.svg";
      case "images":
        return ".png,.jpg,.jpeg,.webp,.gif";
      case "videos":
        return ".mp4,.webm,.ogg,.mov";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ colorScheme: "light" }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4"
        style={{
          backgroundColor: "#ffffff",
          color: "#1f2937",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#1f2937" }}>
            {type === "images" ? "Resim" : type === "icons" ? "İkon" : "Video"}{" "}
            Seç
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6 p-4 rounded-lg">
          <input
            type="file"
            multiple
            accept={getAcceptedTypes()}
            onChange={handleFileUpload}
            className="hidden"
            id="modal-file-upload"
          />
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {library && library[type] && library[type].length > 0 ? (
            library[type].map((item) => (
              <div
                key={item}
                className="cursor-pointer hover:scale-105 transition-transform border-2 border-transparent hover:border-blue-500 rounded p-2"
                onClick={() => handleItemClick(item)}
              >
                {type === "videos" ? (
                  <div className="relative">
                    <video
                      src={item}
                      className="w-full h-24 object-cover rounded"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                      <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item}
                    alt="media"
                    width={100}
                    height={100}
                    className={`w-full rounded ${
                      type === "icons"
                        ? "h-16 object-contain"
                        : "h-24 object-cover"
                    }`}
                  />
                )}
                <p
                  className="text-xs mt-1 truncate text-center"
                  style={{ color: "#6b7280" }}
                >
                  {item.split("/").pop()?.split(".")[0]}
                </p>
              </div>
            ))
          ) : (
            <div
              className="col-span-full text-center py-8"
              style={{ color: "#6b7280" }}
            >
              <p>Henüz {type} yüklenmemiş</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<
    "images" | "icons" | "videos"
  >("images");
  const [mediaSelectionTarget, setMediaSelectionTarget] = useState<string>("");
  const [mediaDetailIndex, setMediaDetailIndex] = useState<number>(-1);

  // Yeni state: Medya kütüphanesi modalı
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !editingProject)
      return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "images");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Resim yükleme başarısız");
      const data = await res.json();
      setEditingProject({ ...editingProject, src: data.url });
      setError("");
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !editingProject)
      return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "icons");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("İkon yükleme başarısız");
      const data = await res.json();
      setEditingProject({ ...editingProject, icon: data.url });
      setError("");
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDetailFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    detailIndex: number
  ) {
    if (!e.target.files || e.target.files.length === 0 || !editingProject)
      return;

    const file = e.target.files[0];
    const detail = editingProject.details[detailIndex];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", detail.type === "image" ? "images" : "videos");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Dosya yükleme başarısız");
      const data = await res.json();

      const newDetails = [...editingProject.details];
      newDetails[detailIndex].content = data.url;
      setEditingProject({
        ...editingProject,
        details: newDetails,
      });
      setError("");
    } catch (err) {
      setError(String(err));
    }
  }

  // Medya modalını açma fonksiyonları
  const openMediaModal = (
    type: "images" | "icons" | "videos",
    target: string,
    detailIndex: number = -1
  ) => {
    setMediaModalType(type);
    setMediaSelectionTarget(target);
    setMediaDetailIndex(detailIndex);
    setShowMediaModal(true);
  };

  // Medya seçimi işleme fonksiyonu
  const handleMediaSelect = (url: string) => {
    if (!editingProject) return;

    if (mediaSelectionTarget === "main-image") {
      setEditingProject({ ...editingProject, src: url });
    } else if (mediaSelectionTarget === "icon") {
      setEditingProject({ ...editingProject, icon: url });
    } else if (
      mediaSelectionTarget.startsWith("detail-") &&
      mediaDetailIndex >= 0
    ) {
      const newDetails = [...editingProject.details];
      newDetails[mediaDetailIndex].content = url;
      setEditingProject({
        ...editingProject,
        details: newDetails,
      });
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  useEffect(() => {
    if (loggedIn) {
      fetchProjects();
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    // Boş alan kontrolü
    if (!username.trim() || !password.trim()) {
      setError("Kullanıcı adı ve şifre gerekli");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      let data;
      try {
        const responseText = await response.text();

        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          throw new Error("Empty response");
        }
      } catch {
        setError("Server yanıt formatı hatalı");
        return;
      }

      if (response.ok && data.success) {
        setLoggedIn(true);
        setError("");
        setUsername("");
        setPassword("");
      } else {
        setError(data.message || "Hatalı kullanıcı adı veya şifre");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Projeler yüklenemedi");
      const data = await res.json();
      setProjects(data);
      setError("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: number) {
    if (!confirm("Projeyi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme başarısız");
      setProjects((p) => p.filter((pr) => pr.id !== id));
      setError("");
    } catch (err) {
      setError(String(err));
    }
  }

  function startAddProject() {
    setEditingProject({
      alt: "",
      year: new Date().getFullYear(),
      status: "IN_DESIGN",
      leftTitle_tr: "",
      leftTitle_en: "",
      leftTitle_ar: "",
      description_en: "",
      description_tr: "",
      description_ar: "",
      location_en: "",
      location_tr: "",
      location_ar: "",
      client_en: "",
      client_tr: "",
      client_ar: "",
      typology_en: "",
      typology_tr: "",
      typology_ar: "",
      src: "",
      details: [],
    });
    setError("");
  }

  function startEditProject(project: Project) {
    setEditingProject(project);
    setError("");
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    if (!editingProject) return;

    const { name, value } = e.target;
    setEditingProject({
      ...editingProject,
      [name]: name === "year" ? Number(value) : value,
    });
  }

  function addDetail() {
    if (!editingProject) return;

    const newDetail: ProjectDetail = {
      type: "text",
      content_tr: "",
      content_en: "",
      content_ar: "",
      title_en: "",
      title_tr: "",
      title_ar: "",
      order: editingProject.details.length,
    };

    setEditingProject({
      ...editingProject,
      details: [...editingProject.details, newDetail],
    });
  }

  function updateDetail(
    index: number,
    field: keyof ProjectDetail,
    value: string | number | DetailType
  ) {
    if (!editingProject) return;

    const newDetails = [...editingProject.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setEditingProject({
      ...editingProject,
      details: newDetails,
    });
  }

  function removeDetail(index: number) {
    if (!editingProject) return;

    const newDetails = editingProject.details.filter((_, i) => i !== index);
    // Sıralamayı güncelle
    newDetails.forEach((detail, i) => {
      detail.order = i;
    });

    setEditingProject({
      ...editingProject,
      details: newDetails,
    });
  }

  function moveDetail(index: number, direction: "up" | "down") {
    if (!editingProject) return;

    const newDetails = [...editingProject.details];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newDetails.length) return;

    // Elemanları yer değiştir
    [newDetails[index], newDetails[targetIndex]] = [
      newDetails[targetIndex],
      newDetails[index],
    ];

    // Sıralamayı güncelle
    newDetails.forEach((detail, i) => {
      detail.order = i;
    });

    setEditingProject({
      ...editingProject,
      details: newDetails,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProject) return;

    // Zorunlu alanlar kontrolü (alt alanı kaldırıldı)
    const requiredFields: (keyof Project)[] = [
      "year",
      "status",
      "leftTitle_tr",
      "leftTitle_en",
      "description_en",
      "description_tr",
      "location_en",
      "location_tr",
      "client_en",
      "client_tr",
      "typology_en",
      "typology_tr",
      "src",
    ];

    for (const field of requiredFields) {
      const value = editingProject[field];
      if (!value || value.toString().trim() === "") {
        setError(`"${field}" alanı zorunludur.`);
        return;
      }
    }

    // Alt text'i Türkçe başlık ile otomatik doldur
    const projectToSubmit = {
      ...editingProject,
      alt:
        editingProject.leftTitle_tr || editingProject.leftTitle_en || "Project",
    };

    try {
      console.log(
        "Frontend'den Gönderilen Güncelleme Verisi:",
        JSON.stringify(projectToSubmit, null, 2)
      );

      let res;
      if (editingProject.id) {
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectToSubmit),
        });
      } else {
        res = await fetch(`/api/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectToSubmit),
        });
      }

      if (!res.ok) throw new Error("İşlem başarısız");

      const updatedProject = await res.json();

      setProjects((prev) => {
        if (editingProject.id) {
          return prev.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          );
        } else {
          return [...prev, updatedProject];
        }
      });

      setEditingProject(null);
      setError("");
    } catch (err) {
      setError(String(err));
    }
  }

  function handleCancel() {
    setEditingProject(null);
    setError("");
  }

  // Login sayfası - Light Mode Fixed
  if (!loggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: "#f3f4f6",
          colorScheme: "light",
        }}
      >
        <div
          className="p-8 rounded shadow-md w-full max-w-md"
          style={{
            backgroundColor: "#ffffff",
            color: "#1f2937",
          }}
        >
          <h1
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: "#1f2937" }}
          >
            Admin Girişi
          </h1>

          {error && (
            <div
              className="mb-4 font-semibold text-center"
              style={{
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                padding: "0.75rem",
                borderRadius: "0.5rem",
              }}
            >
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Kullanıcı Adı"
            className="w-full p-2 border rounded mb-4"
            style={{
              borderColor: "#d1d5db",
              backgroundColor: "#ffffff",
              color: "#1f2937",
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Şifre"
            className="w-full p-2 border rounded mb-6"
            style={{
              borderColor: "#d1d5db",
              backgroundColor: "#ffffff",
              color: "#1f2937",
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: 6,
                display: "inline-block",
                minWidth: 100,
                minHeight: 40,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                transition: "background-color 0.2s ease",
              }}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editing sayfası - Light Mode Fixed
  if (editingProject) {
    return (
      <div style={{ colorScheme: "light" }}>
        <MediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSelect={handleMediaSelect}
          type={mediaModalType}
        />

        <div
          className="min-h-screen p-8"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="p-6 rounded shadow space-y-6"
              style={{
                backgroundColor: "#ffffff",
                color: "#1f2937",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "#1f2937" }}
              >
                {editingProject.id ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
              </h2>

              {error && (
                <p
                  className="font-semibold p-3 rounded"
                  style={{
                    color: "#dc2626",
                    backgroundColor: "#fef2f2",
                  }}
                >
                  {error}
                </p>
              )}

              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#374151" }}
                  >
                    Yıl *
                  </span>
                  <input
                    type="number"
                    name="year"
                    value={editingProject.year}
                    onChange={handleChange}
                    className="w-full border rounded p-3 mt-1"
                    style={{
                      borderColor: "#d1d5db",
                      backgroundColor: "#ffffff",
                      color: "#1f2937",
                    }}
                    required
                    min={1900}
                    max={2100}
                  />
                </label>

                <label className="block">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#374151" }}
                  >
                    Durum *
                  </span>
                  <select
                    name="status"
                    value={editingProject.status}
                    onChange={handleChange}
                    className="w-full border rounded p-3 mt-1"
                    style={{
                      borderColor: "#d1d5db",
                      backgroundColor: "#ffffff",
                      color: "#1f2937",
                    }}
                    required
                  >
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="UNDER_CONSTRUCTION">Yapım Aşamasında</option>
                    <option value="IN_DESIGN">Tasarım Aşamasında</option>
                  </select>
                </label>
              </div>

              {/* Resim ve İkon - Light Mode Fixed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ana Resim */}
                <div>
                  <span
                    className="text-sm font-medium block mb-1"
                    style={{ color: "#374151" }}
                  >
                    Ana Resim *
                  </span>

                  <div
                    className="mb-3 p-3 border rounded text-xs"
                    style={{
                      backgroundColor: "#f0f9ff",
                      borderColor: "#bae6fd",
                      color: "#1e40af",
                    }}
                  >
                    <p className="font-medium mb-1">Resim Gereksinimleri:</p>
                    <ul className="space-y-1">
                      <li>
                        • <strong>Format:</strong> JPEG, PNG, WebP, GIF, SVG
                      </li>
                      <li>
                        • <strong>Boyut:</strong> Minimum 800x600px (4:3 veya
                        16:9 oran)
                      </li>
                      <li>
                        • <strong>Dosya boyutu:</strong> Maksimum 10MB
                      </li>
                      <li>
                        • <strong>Kalite:</strong> Yüksek çözünürlük, net
                        görüntü
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <label
                      htmlFor="image-upload"
                      className="inline-block cursor-pointer px-4 py-2 rounded transition"
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                      }}
                    >
                      Resim Seç
                    </label>
                    <button
                      onClick={() => openMediaModal("images", "main-image")}
                      className="cursor-pointer px-6 py-2 rounded transition-all inline-block"
                      style={{
                        backgroundColor: "#ea580c",
                        color: "#ffffff",
                        minWidth: "210px",
                      }}
                    >
                      Kütüphaneden Resim Seç
                    </button>
                  </div>

                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {editingProject.src && (
                    <div className="mt-2 relative w-full h-48 rounded border overflow-hidden pointer-events-none">
                      <Image
                        src={editingProject.src}
                        alt="Project image preview"
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority={false}
                      />
                    </div>
                  )}
                </div>

                {/* İkon */}
                <div>
                  <span
                    className="text-sm font-medium block mb-1"
                    style={{ color: "#374151" }}
                  >
                    İkon
                  </span>

                  <div
                    className="mb-3 p-3 border rounded text-xs"
                    style={{
                      backgroundColor: "#eff6ff",
                      borderColor: "#bfdbfe",
                      color: "#1e40af",
                    }}
                  >
                    <p className="font-medium mb-1">İkon Gereksinimleri:</p>
                    <ul className="space-y-1">
                      <li>
                        • <strong>Format:</strong> PNG, SVG, JPEG, WebP, GIF
                      </li>
                      <li>
                        • <strong>Boyut:</strong> 64x64px - 256x256px (kare
                        format)
                      </li>
                      <li>
                        • <strong>Dosya boyutu:</strong> Maksimum 10MB
                      </li>
                      <li>
                        • <strong>Tasarım:</strong> Basit, net, yüksek kontrast
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <label
                      htmlFor="icon-upload"
                      className="inline-block cursor-pointer px-4 py-2 rounded transition"
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                      }}
                    >
                      İkon Seç
                    </label>

                    <button
                      type="button"
                      onClick={() => openMediaModal("icons", "icon")}
                      className="cursor-pointer px-10 py-2 rounded transition-all inline-block"
                      style={{
                        backgroundColor: "#ea580c",
                        color: "#ffffff",
                        minWidth: "210px",
                      }}
                    >
                      Kütüphaneden İkon Seç
                    </button>
                  </div>

                  <input
                    type="file"
                    id="icon-upload"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                    onChange={handleIconUpload}
                    className="hidden"
                  />

                  {editingProject.icon && (
                    <div className="mt-2 relative w-20 h-16 rounded border overflow-hidden pointer-events-none">
                      <Image
                        src={editingProject.icon}
                        alt="Icon preview"
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="80px"
                        priority={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Çok Dilli Başlıklar */}
              <div className="space-y-4">
                <h3
                  className="text-lg font-semibold border-b pb-2"
                  style={{
                    color: "#1f2937",
                    borderColor: "#e5e7eb",
                  }}
                >
                  Proje Başlıkları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Başlık (TR) *
                    </span>
                    <input
                      type="text"
                      name="leftTitle_tr"
                      value={editingProject.leftTitle_tr}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                      required
                    />
                  </label>

                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Başlık (EN) *
                    </span>
                    <input
                      type="text"
                      name="leftTitle_en"
                      value={editingProject.leftTitle_en}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                      required
                    />
                  </label>

                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Başlık (AR)
                    </span>
                    <input
                      type="text"
                      name="leftTitle_ar"
                      value={editingProject.leftTitle_ar || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Çok Dilli Açıklamalar */}
              <div className="space-y-4">
                <h3
                  className="text-lg font-semibold border-b pb-2"
                  style={{
                    color: "#1f2937",
                    borderColor: "#e5e7eb",
                  }}
                >
                  Açıklamalar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Açıklama (TR) *
                    </span>
                    <textarea
                      name="description_tr"
                      value={editingProject.description_tr}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                      rows={4}
                      required
                    />
                  </label>

                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Açıklama (EN) *
                    </span>
                    <textarea
                      name="description_en"
                      value={editingProject.description_en}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                      rows={4}
                      required
                    />
                  </label>

                  <label className="block">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#374151" }}
                    >
                      Açıklama (AR)
                    </span>
                    <textarea
                      name="description_ar"
                      value={editingProject.description_ar || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-3 mt-1"
                      style={{
                        borderColor: "#d1d5db",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                      }}
                      rows={4}
                    />
                  </label>
                </div>
              </div>

              {/* Diğer Çok Dilli Alanlar */}
              <div className="space-y-6">
                {/* Konum */}
                <div>
                  <h3
                    className="text-lg font-semibold border-b pb-2 mb-4"
                    style={{
                      color: "#1f2937",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    Konum
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Konum (TR) *
                      </span>
                      <input
                        type="text"
                        name="location_tr"
                        value={editingProject.location_tr}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Konum (EN) *
                      </span>
                      <input
                        type="text"
                        name="location_en"
                        value={editingProject.location_en}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Konum (AR)
                      </span>
                      <input
                        type="text"
                        name="location_ar"
                        value={editingProject.location_ar || ""}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Müşteri */}
                <div>
                  <h3
                    className="text-lg font-semibold border-b pb-2 mb-4"
                    style={{
                      color: "#1f2937",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    Müşteri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Müşteri (TR) *
                      </span>
                      <input
                        type="text"
                        name="client_tr"
                        value={editingProject.client_tr}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Müşteri (EN) *
                      </span>
                      <input
                        type="text"
                        name="client_en"
                        value={editingProject.client_en}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Müşteri (AR)
                      </span>
                      <input
                        type="text"
                        name="client_ar"
                        value={editingProject.client_ar || ""}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Tipoloji */}
                <div>
                  <h3
                    className="text-lg font-semibold border-b pb-2 mb-4"
                    style={{
                      color: "#1f2937",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    Tipoloji
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Tipoloji (TR) *
                      </span>
                      <input
                        type="text"
                        name="typology_tr"
                        value={editingProject.typology_tr}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Tipoloji (EN) *
                      </span>
                      <input
                        type="text"
                        name="typology_en"
                        value={editingProject.typology_en}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                        required
                      />
                    </label>

                    <label className="block">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        Tipoloji (AR)
                      </span>
                      <input
                        type="text"
                        name="typology_ar"
                        value={editingProject.typology_ar || ""}
                        onChange={handleChange}
                        className="w-full border rounded p-3 mt-1"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: "#ffffff",
                          color: "#1f2937",
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Proje Detayları */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3
                    className="text-lg font-semibold border-b pb-2"
                    style={{
                      color: "#1f2937",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    Proje Detayları
                  </h3>
                  <button
                    type="button"
                    onClick={addDetail}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    Detay Ekle
                  </button>
                </div>

                {editingProject.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-4 space-y-4"
                    style={{
                      borderColor: "#e5e7eb",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="font-medium"
                        style={{ color: "#374151" }}
                      >
                        Detay #{idx + 1}
                      </span>
                      <div className="flex space-x-2">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveDetail(idx, "up")}
                            className="hover:underline text-sm"
                            style={{ color: "#2563eb" }}
                          >
                            ↑ Yukarı
                          </button>
                        )}
                        <span className="inline-block mx-2"></span>
                        {idx < editingProject.details.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveDetail(idx, "down")}
                            className="hover:underline text-sm"
                            style={{ color: "#2563eb" }}
                          >
                            ↓ Aşağı
                          </button>
                        )}
                        <span className="inline-block mx-2"></span>
                        <button
                          type="button"
                          onClick={() => removeDetail(idx)}
                          className="hover:underline text-sm"
                          style={{ color: "#dc2626" }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    {/* Tip seçimi */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <label className="block">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#374151" }}
                        >
                          Tip
                        </span>
                        <select
                          value={detail.type}
                          onChange={(e) =>
                            updateDetail(
                              idx,
                              "type",
                              e.target.value as DetailType
                            )
                          }
                          className="w-full border rounded p-2 mt-1"
                          style={{
                            borderColor: "#d1d5db",
                            backgroundColor: "#ffffff",
                            color: "#1f2937",
                          }}
                        >
                          <option value="text">Metin</option>
                          <option value="image">Resim</option>
                          <option value="video">Video</option>
                          <option value="location">Konum</option>
                        </select>
                      </label>
                    </div>

                    {/* İçerik Alanları */}
                    {detail.type === "text" ? (
                      <div className="space-y-4">
                        <h4
                          className="text-sm font-medium"
                          style={{ color: "#374151" }}
                        >
                          Metin Başlıkları
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              Başlık (TR)
                            </span>
                            <input
                              type="text"
                              value={detail.title_tr || ""}
                              onChange={(e) =>
                                updateDetail(idx, "title_tr", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                            />
                          </label>
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              Başlık (EN)
                            </span>
                            <input
                              type="text"
                              value={detail.title_en || ""}
                              onChange={(e) =>
                                updateDetail(idx, "title_en", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                            />
                          </label>
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              Başlık (AR)
                            </span>
                            <input
                              type="text"
                              value={detail.title_ar || ""}
                              onChange={(e) =>
                                updateDetail(idx, "title_ar", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                            />
                          </label>
                        </div>
                        <h4
                          className="text-sm font-medium"
                          style={{ color: "#374151" }}
                        >
                          Metin İçerikleri
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              İçerik (TR)
                            </span>
                            <textarea
                              value={detail.content_tr || ""}
                              onChange={(e) =>
                                updateDetail(idx, "content_tr", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                              rows={3}
                            />
                          </label>
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              İçerik (EN)
                            </span>
                            <textarea
                              value={detail.content_en || ""}
                              onChange={(e) =>
                                updateDetail(idx, "content_en", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                              rows={3}
                            />
                          </label>
                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              İçerik (AR)
                            </span>
                            <textarea
                              value={detail.content_ar || ""}
                              onChange={(e) =>
                                updateDetail(idx, "content_ar", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                              rows={3}
                            />
                          </label>
                        </div>
                      </div>
                    ) : detail.type === "location" ? (
                      <div className="space-y-4">
                        <h4
                          className="text-sm font-medium"
                          style={{ color: "#374151" }}
                        >
                          Konum Bilgileri
                        </h4>
                        <div className="space-y-4">
                          <div
                            className="border rounded p-3"
                            style={{
                              backgroundColor: "#fefce8",
                              borderColor: "#fde047",
                              color: "#854d0e",
                            }}
                          >
                            <p className="text-sm">
                              <strong>Önemli:</strong> Google Maps kısaltılmış
                              url değil de emmed içerin url yapıştırın.
                            </p>
                            <p className="text-xs mt-1">
                              Örnek:
                              https://www.google.com/maps/embed?pb=!1m18!1m12...
                            </p>
                          </div>

                          <label className="block">
                            <span
                              className="text-sm font-medium"
                              style={{ color: "#374151" }}
                            >
                              Google Maps Embed URL
                            </span>
                            <input
                              type="url"
                              value={detail.content || ""}
                              onChange={(e) =>
                                updateDetail(idx, "content", e.target.value)
                              }
                              className="w-full border rounded p-2 mt-1"
                              style={{
                                borderColor: "#d1d5db",
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                              }}
                              placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                          </label>

                          {detail.content && (
                            <div className="mt-2">
                              <span
                                className="text-sm font-medium block mb-2"
                                style={{ color: "#374151" }}
                              >
                                Harita Önizlemesi:
                              </span>
                              <div className="w-full h-64 border rounded overflow-hidden">
                                <iframe
                                  src={convertToEmbedUrl(detail.content)}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  title="Konum Haritası"
                                  onError={(e) => {
                                    console.error("Map iframe error:", e);
                                  }}
                                />
                              </div>
                              {detail.content.includes("maps.app.goo.gl") && (
                                <div
                                  className="mt-2 p-2 border rounded"
                                  style={{
                                    backgroundColor: "#fef2f2",
                                    borderColor: "#fecaca",
                                    color: "#991b1b",
                                  }}
                                >
                                  <p className="text-sm"></p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="mb-3 p-3 border rounded text-xs"
                          style={{
                            backgroundColor: "#faf5ff",
                            borderColor: "#c4b5fd",
                            color: "#6b21a8",
                          }}
                        >
                          <p className="font-medium mb-1">
                            {detail.type === "image" ? "Resim" : "Video"}{" "}
                            Gereksinimleri:
                          </p>
                          <ul className="space-y-1">
                            {detail.type === "image" ? (
                              <>
                                <li>
                                  • <strong>Format:</strong> JPEG, PNG, WebP,
                                  GIF, SVG
                                </li>
                                <li>
                                  • <strong>Boyut:</strong> Minimum 800x600px
                                </li>
                                <li>
                                  • <strong>Dosya boyutu:</strong> Maksimum 10MB
                                </li>
                              </>
                            ) : (
                              <>
                                <li>
                                  • <strong>Format:</strong> MP4, WebM, MOV,
                                  AVI, MPEG
                                </li>
                                <li>
                                  • <strong>Çözünürlük:</strong> Minimum 720p
                                  (1280x720)
                                </li>
                                <li>
                                  • <strong>Dosya boyutu:</strong> Maksimum
                                  100MB
                                </li>
                                <li>
                                  • <strong>Süre:</strong> Önerilen maksimum 5
                                  dakika
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div className="flex gap-2 mb-2">
                          <label
                            className="inline-block cursor-pointer px-4 py-2 rounded transition"
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                            }}
                          >
                            {detail.type === "image" ? "Resim" : "Video"} Yükle
                            <input
                              type="file"
                              id={`detail-file-${idx}`}
                              accept={
                                detail.type === "image"
                                  ? "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                                  : "video/mp4,video/webm,video/mov,video/avi,video/mpeg,video/quicktime"
                              }
                              onChange={(e) => handleDetailFileUpload(e, idx)}
                              style={{ display: "none" }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              openMediaModal(
                                detail.type === "image" ? "images" : "videos",
                                `detail-${idx}`,
                                idx
                              )
                            }
                            className="cursor-pointer px-32 py-3 rounded transition-all inline-block text-base"
                            style={{
                              backgroundColor: "#ea580c",
                              color: "#ffffff",
                              minWidth: "200px",
                            }}
                          >
                            Kütüphaneden{" "}
                            {detail.type === "image" ? "Resim" : "Video"} Seç
                          </button>
                        </div>

                        {detail.content && (
                          <div className="mt-2">
                            {detail.type === "image" ? (
                              <div className="relative w-full aspect-[4/3] rounded border overflow-hidden">
                                <Image
                                  key={detail.content}
                                  src={detail.content}
                                  alt="Detail preview"
                                  fill
                                  style={{ objectFit: "cover" }}
                                  sizes="(max-width: 768px) 100vw, 600px"
                                  priority={false}
                                />
                              </div>
                            ) : (
                              <video
                                key={detail.content}
                                controls
                                className="w-full max-h-48 rounded border"
                              >
                                <source src={detail.content} />
                                Video desteklenmiyor.
                              </video>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Butonları */}
              <div
                className="flex justify-between pt-6"
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "#ffffff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {editingProject.id ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Ana admin sayfası - Light Mode Fixed
  return (
    <div style={{ colorScheme: "light" }}>
      {/* Ana Medya Kütüphanesi Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
      />

      <div className="min-h-screen p-8" style={{ backgroundColor: "#f9fafb" }}>
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#2563eb" }}>
              AVA GROUP - Admin Panel
            </h1>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              Çıkış Yap
            </button>
          </header>

          <section className="mb-6">
            <div className="flex gap-4">
              <button
                onClick={startAddProject}
                style={{
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                + Yeni Proje Ekle
              </button>

              <button
                onClick={() => setShowMediaLibrary(true)}
                style={{
                  backgroundColor: "#f97316",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                📁 Medya Kütüphanesini Düzenle
              </button>
            </div>
          </section>

          <section>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "#1f2937" }}
            >
              Projeler ({projects.length})
            </h2>

            {loading && (
              <div className="text-center py-8">
                <div
                  className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: "#2563eb" }}
                ></div>
                <p className="mt-2" style={{ color: "#6b7280" }}>
                  Yükleniyor...
                </p>
              </div>
            )}

            {error && (
              <div
                className="mb-4 font-semibold p-3 rounded"
                style={{
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                }}
              >
                {error}
              </div>
            )}

            <div
              className="rounded-lg shadow overflow-hidden"
              style={{ backgroundColor: "#ffffff" }}
            >
              <table className="w-full">
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      ID
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      Resim
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      Proje Adı
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      Yıl
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      Durum
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      Detay Sayısı
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      style={{ color: "#6b7280" }}
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e5e7eb",
                  }}
                >
                  {projects.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center"
                        style={{ color: "#6b7280" }}
                      >
                        Henüz kayıtlı proje bulunmuyor.
                      </td>
                    </tr>
                  )}

                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        style={{ color: "#1f2937" }}
                      >
                        #{project.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project.src && (
                          <div className="relative w-16 h-12 rounded overflow-hidden">
                            <Image
                              src={project.src}
                              alt={project.alt}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="64px"
                              priority={false}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#1f2937" }}
                        >
                          {project.leftTitle_tr}
                        </div>
                        <div className="text-sm" style={{ color: "#6b7280" }}>
                          {project.alt}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "#1f2937" }}
                      >
                        {project.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor:
                              project.status === "COMPLETED"
                                ? "#dcfce7"
                                : project.status === "UNDER_CONSTRUCTION"
                                ? "#fef3c7"
                                : "#dbeafe",
                            color:
                              project.status === "COMPLETED"
                                ? "#166534"
                                : project.status === "UNDER_CONSTRUCTION"
                                ? "#92400e"
                                : "#1e40af",
                          }}
                        >
                          {project.status === "COMPLETED" && "Tamamlandı"}
                          {project.status === "UNDER_CONSTRUCTION" &&
                            "Yapım Aşamasında"}
                          {project.status === "IN_DESIGN" &&
                            "Tasarım Aşamasında"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "#1f2937" }}
                      >
                        {project.details?.length || 0} detay
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditProject(project)}
                          className="mr-4"
                          style={{ color: "#2563eb" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#1d4ed8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#2563eb";
                          }}
                        >
                          Düzenle
                        </button>
                        <span
                          className="inline-block mx-2"
                          style={{ color: "#6b7280" }}
                        >
                          |
                        </span>
                        <button
                          onClick={() => deleteProject(project.id!)}
                          style={{ color: "#dc2626" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#b91c1c";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#dc2626";
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
