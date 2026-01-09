"use client";

import { useState, useRef, useEffect } from "react";

import SplashScreen from "../../components/SplashScreen";
import Navbar from "../../components/Navbar";
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
      .then((res) => res.json())
      .then((data: ProjectData[]) => setProjects(data))
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
        <main className="flex flex-col h-screen overflow-hidden">
          <Navbar />

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth"
          >
            <BottomSection
              scrollContainerRef={scrollContainerRef}
              projects={projects}
            />
          </div>
        </main>
      )}
    </>
  );
}
