// src/components/AdminProjectList.tsx
"use client";

import React from "react";

interface ProjectData {
  id: number;
  leftTitle_en: string;
  src: string;
  alt: string;
  status: "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN";
  year: number;
}

interface AdminProjectListProps {
  projects: ProjectData[];
  onSelect: (project: ProjectData) => void;
  selectedProjectId?: number;
}

export default function AdminProjectList({
  projects,
  onSelect,
  selectedProjectId,
}: AdminProjectListProps) {
  const getStatusBadge = (status: ProjectData["status"]) => {
    const statusConfig = {
      COMPLETED: "bg-green-100 text-green-800",
      UNDER_CONSTRUCTION: "bg-yellow-100 text-yellow-800",
      IN_DESIGN: "bg-blue-100 text-blue-800",
    };

    const statusText = {
      COMPLETED: "Tamamlandı",
      UNDER_CONSTRUCTION: "Yapım Aşamasında",
      IN_DESIGN: "Tasarım Aşamasında",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${statusConfig[status]}`}
      >
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Proje Listesi ({projects.length})
      </h2>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Henüz proje yok</p>
          <p className="text-sm"></p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedProjectId === project.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 truncate">
                  {project.leftTitle_en || `Proje ${project.id}`}
                </h3>
                {getStatusBadge(project.status)}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Yıl: {project.year}</span>
                {project.src && (
                  <span className="text-xs text-green-600">📷 Resim var</span>
                )}
              </div>

              {project.alt && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {project.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
