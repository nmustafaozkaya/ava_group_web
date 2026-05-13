"use client";

import { useState, useRef, useEffect } from "react";

import SplashScreen from "../../components/SplashScreen";
import BottomSection from "../../components/BottomSection";

interface ProjectDetail {
  id: number;
  type: "image" | "text";
  content: string;
  title_en: string;
  title_tr: string;
  title_ar: string;
  projectId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  id: number;
  src: string;
  alt: string;
  status: "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN";
  icon: string;
  year: number;
  leftTitle_en: string;
  leftTitle_tr: string;
  leftTitle_ar: string;
  description_en: string;
  description_tr: string;
  description_ar: string;
  location_en: string;
  location_tr: string;
  location_ar: string;
  client_en: string;
  client_tr: string;
  client_ar: string;
  typology_en: string;
  typology_tr: string;
  typology_ar: string;
  createdAt: string;
  updatedAt: string;
  details: ProjectDetail[];
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (res) => {
        const ct = res.headers.get("content-type") ?? "";
        if (!res.ok || !ct.includes("application/json")) {
          console.error(
            "Projects API error:",
            res.status,
            "Expected JSON; is Prisma generated and DATABASE_URL set?"
          );
          return null;
        }
        return (await res.json()) as ProjectData[];
      })
      .then((data) => {
        if (data) setProjects(data);
      })
      .catch(console.error);
  }, []);

  const handleAnimationComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onAnimationComplete={handleAnimationComplete} />
      )}

      {!showSplash && (
        <div className="flex flex-col h-screen overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth"
          >
            <BottomSection
              scrollContainerRef={scrollContainerRef}
              projects={projects}
            />
          </div>
        </div>
      )}
    </>
  );
}
