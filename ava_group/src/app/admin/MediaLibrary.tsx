"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

type MediaType = "images" | "icons" | "videos";

interface MediaResponse {
  images: string[];
  icons: string[];
  videos: string[];
}

interface Props {
  onSelectImage?: (image: string) => void;
  onSelectIcon?: (icon: string) => void;
  onSelectVideo?: (video: string) => void;
}

const TABS: { key: MediaType; label: string }[] = [
  { key: "images", label: "Resimler" },
  { key: "icons", label: "İkonlar" },
  { key: "videos", label: "Videolar" },
];

export default function MediaLibrary({
  onSelectImage,
  onSelectIcon,
  onSelectVideo,
}: Props) {
  const [library, setLibrary] = useState<MediaResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MediaType>("images");
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    try {
      const res = await fetch("/api/library");
      if (!res.ok) throw new Error("API yüklenemedi");
      const data = await res.json();
      setLibrary(data);
    } catch (error) {
      console.error("Kütüphane yüklenirken hata:", error);
    }
  }

  const getFileName = (path: string) => path.split("/").pop() || "";

  const getAcceptedTypes = () => {
    switch (activeTab) {
      case "icons":
        return ".png,.jpg,.jpeg,.webp,.gif,.svg";
      case "images":
        return ".png,.jpg,.jpeg,.webp,.gif";
      case "videos":
        return ".mp4,.webm,.ogg,.mov";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setUploading(true);
    setUploadProgress(0);

    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("type", activeTab);

      try {
        const res = await fetch("/api/library/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          console.error(`${files[i].name} yüklenemedi`);
        } else {
          setUploadProgress(((i + 1) / files.length) * 100);
        }
      } catch (error) {
        console.error("Yükleme hatası:", error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    await loadLibrary();

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelect = (item: string) => {
    setSelected(item);
    if (activeTab === "images") onSelectImage?.(item);
    if (activeTab === "icons") onSelectIcon?.(item);
    if (activeTab === "videos") onSelectVideo?.(item);
  };

  if (!library) return <div>Yükleniyor...</div>;

  const currentItems = library[activeTab];

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-7xl mx-auto">
      {/* Sekmeler */}
      <div className="flex mb-6 border-b gap-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 mr-2 rounded-t-lg font-medium transition-colors text-orange-500 border-orange-400 border-b-2 ${
              activeTab === tab.key
                ? "bg-orange-100 text-orange-700 border-b-4"
                : "bg-gray-200 text-orange-500 hover:bg-orange-200"
            }`}
            style={{ marginRight: 16 }}
          >
            {tab.label} ({library[tab.key]?.length ?? 0})
          </button>
        ))}
      </div>

      {/* Dosya yükleme */}
      <div className="mb-6 flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypes()}
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Yükleniyor..." : `${activeTab} Yükle`}
        </label>
        {uploading && (
          <div className="flex-1">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-700 mt-1">
              {Math.round(uploadProgress)}%
            </span>
          </div>
        )}
      </div>

      {/* Medya listesi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentItems.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-12">
            Henüz {activeTab} yüklenmemiş.
          </p>
        )}

        {currentItems.map((item) => {
          const fileName = getFileName(item);
          const isSelected = selected === item;

          // Her medya tipi için farklı border renkleri
          const getBorderClass = () => {
            if (!isSelected) {
              return "border-2 border-gray-200 hover:border-gray-300";
            }

            switch (activeTab) {
              case "icons":
                return "border-2 border-blue-500";
              case "images":
                return "border-2 border-green-500";
              case "videos":
                return "border-2 border-purple-500";
              default:
                return "border-2 border-gray-200";
            }
          };

          return (
            <div
              key={item}
              className={`relative cursor-pointer rounded-lg overflow-hidden group transition-all duration-200 ${getBorderClass()}`}
              onClick={() => handleSelect(item)}
            >
              {activeTab === "videos" ? (
                <div className="relative">
                  <video
                    src={item}
                    className="w-full h-32 object-cover"
                    muted
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={item}
                    alt={fileName}
                    width={200}
                    height={120}
                    className={`w-full ${
                      activeTab === "icons"
                        ? "h-32 object-contain p-2"
                        : "h-32 object-cover"
                    }`}
                  />
                </div>
              )}

              <p
                className="text-xs text-center text-gray-700 truncate mt-1 px-1"
                title={fileName}
              >
                {fileName}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
