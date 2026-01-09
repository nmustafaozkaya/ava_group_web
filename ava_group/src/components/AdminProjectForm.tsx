// src/components/AdminProjectForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ProjectData {
  id: number;
  leftTitle_en: string;
  src: string;
  alt: string;
  status: "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN";
  year: number;
}

interface AdminProjectFormProps {
  project: ProjectData | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function AdminProjectForm({
  project,
  onSave,
  onCancel,
  onDelete,
}: AdminProjectFormProps) {
  const [formData, setFormData] = useState<ProjectData>({
    id: 0,
    leftTitle_en: "",
    src: "",
    alt: "",
    status: "IN_DESIGN",
    year: new Date().getFullYear(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData({
        id: 0,
        leftTitle_en: "",
        src: "",
        alt: "",
        status: "IN_DESIGN",
        year: new Date().getFullYear(),
      });
    }
    setError("");
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url =
        formData.id === 0 ? "/api/projects" : `/api/projects/${formData.id}`;
      const method = formData.id === 0 ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Kaydetme işlemi başarısız");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" ? parseInt(value) || new Date().getFullYear() : value,
    }));
  };

  if (!project) {
    return (
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Proje seçin veya yeni proje oluşturun</p>
          <p className="text-sm"></p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {formData.id === 0 ? "Yeni Proje Oluştur" : "Projeyi Düzenle"}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Hata:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="leftTitle_en"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Proje Başlığı (İngilizce)
          </label>
          <input
            type="text"
            id="leftTitle_en"
            name="leftTitle_en"
            value={formData.leftTitle_en}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Proje başlığını girin"
          />
        </div>

        <div>
          <label
            htmlFor="src"
            className="block text-sm font-medium text-gray-700 mb-1"
          ></label>
          <input
            type="url"
            id="src"
            name="src"
            value={formData.src}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label
            htmlFor="alt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Resim Açıklaması (Alt Text)
          </label>
          <textarea
            id="alt"
            name="alt"
            value={formData.alt}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resimin açıklamasını girin"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Proje Durumu
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="IN_DESIGN">Tasarım Aşamasında</option>
            <option value="UNDER_CONSTRUCTION">Yapım Aşamasında</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Proje Yılı
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="2000"
            max="2030"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? "Kaydediliyor..." : "💾 Kaydet"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            ❌ İptal
          </button>

          {formData.id !== 0 && (
            <button
              type="button"
              onClick={onDelete}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              🗑️ Sil
            </button>
          )}
        </div>
      </form>

      {formData.src && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Resim Önizlemesi:
          </p>
          <Image
            src={formData.src}
            alt={formData.alt || "Proje resmi"}
            width={300} // ya da kendi belirlediğin bir değer
            height={128}
            className="object-cover rounded border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
