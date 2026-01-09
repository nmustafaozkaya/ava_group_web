"use client";
import { RefObject, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import ProjectDetailRenderer from "./ProjectDetailRenderer";

interface BottomSectionProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  projects: ProjectData[];
}

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

interface ProjectData {
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

// Mobil cihaz tespiti için hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
};

const ProjectCard = ({
  project,
  isSelected,
  onSelect,
  id,
  isMobile,
}: {
  project: ProjectData;
  isSelected: boolean;
  onSelect: () => void;
  id: string;
  isMobile: boolean;
}) => {
  const currentLocale = useLocale();
  const naturalImageWidth = 1200;
  const naturalImageHeight = 750;

  // Dil seçimi için helper fonksiyon
  const getLocalizedText = useCallback(
    (baseKey: string): string => {
      const localizedKey = `${baseKey}_${currentLocale}` as keyof ProjectData;
      const localizedText = project[localizedKey];

      // Fallback olarak İngilizce kullan
      const fallbackKey = `${baseKey}_en` as keyof ProjectData;
      const fallbackText = project[fallbackKey];

      if (typeof localizedText === "string" && localizedText) {
        return localizedText;
      }
      if (typeof fallbackText === "string") {
        return fallbackText;
      }
      return "";
    },
    [currentLocale, project]
  );

  // Proje alanlarını dinamik dil seçimi ile çekme
  const leftTitle = getLocalizedText("leftTitle");

  // Mobilde her zaman detay göster, desktop'ta seçili olana göre
  const shouldShowDetail = isMobile || isSelected;

  return (
    <div
      id={id}
      className={`relative transition-all duration-700 ease-in-out ${
        shouldShowDetail
          ? "p-0 mb-16 max-w-full z-10"
          : "p-6 mb-10 max-w-[1000px] z-1"
      }`}
    >
      {shouldShowDetail ? (
        <ProjectDetailRenderer
          project={project}
          details={project.details || []}
        />
      ) : (
        <div className="flex flex-row items-start justify-start gap-20 pl-10 -ml-40">
          {/* İkon ve Başlık Bölümü */}
          <div className="flex flex-col items-start w-[140px] pt-15 flex-shrink-0">
            {project.icon && (
              <Image
                src={project.icon}
                alt="project icon"
                width={40}
                height={40}
                className="mb-2 project-icon"
                style={{ objectFit: "contain" }}
              />
            )}
            <h3 className="text-2xl font-bold text-foreground text-left">
              {leftTitle}
            </h3>
          </div>
          {/* Resim Bölümü */}
          <div
            onClick={onSelect}
            className="relative cursor-pointer w-[400px] h-[280px] overflow-hidden rounded-xl shadow-lg transition-all"
          >
            <Image
              src={project.src}
              alt={project.alt}
              width={naturalImageWidth}
              height={naturalImageHeight}
              className="w-full h-full object-cover"
              priority
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function BottomSection({
  scrollContainerRef,
  projects,
}: BottomSectionProps) {
  const t = useTranslations();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const previousProjects = projects.filter((p) => p.status === "COMPLETED");
  const currentProjects = projects.filter(
    (p) => p.status === "UNDER_CONSTRUCTION"
  );
  const upcomingProjects = projects.filter((p) => p.status === "IN_DESIGN");

  const scrollToElement = useCallback(
    (elementId: string) => {
      if (!scrollContainerRef.current) return;
      const scrollContainer = scrollContainerRef.current;
      const targetElement = document.getElementById(elementId);
      if (!targetElement) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = targetElement.getBoundingClientRect();
      const elementOffsetTop =
        elementRect.top - containerRect.top + scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      const elementHeight = targetElement.offsetHeight;
      const scrollTop =
        elementOffsetTop - containerHeight / 2 + elementHeight / 2;
      scrollContainer.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    },
    [scrollContainerRef]
  );

  const handleProjectSelect = (index: number, elementId: string) => {
    // Mobilde tıklama işlemi yapma, zaten açık
    if (isMobile) return;

    if (selectedIndex === index) return;
    setSelectedIndex(index);
    setTimeout(() => {
      scrollToElement(elementId);
    }, 150);
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        scrollToElement(hash.substring(1));
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    setTimeout(handleHashChange, 100);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [scrollContainerRef, scrollToElement]);

  const renderProjectSection = (
    titleKey: string,
    projectsToRender: ProjectData[],
    categoryString: string,
    startIndex: number
  ) => {
    const translatedTitle = t(titleKey);
    const sectionId = `${categoryString
      .toLowerCase()
      .replace(/\s/g, "-")}-projects`;

    return (
      <section
        id={sectionId}
        className="w-full max-w-[1920px] mx-auto mb-20 scroll-mt-24 flex flex-col"
      >
        <h2 className="text-4xl font-bold mb-10 text-center text-foreground">
          {translatedTitle}
        </h2>
        {projectsToRender.length > 0 ? (
          <div className="flex flex-col items-center">
            {projectsToRender.map((project, idx) => {
              const globalIndex = startIndex + idx;
              const elementId = `${sectionId}-card-${project.id}`;
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedIndex === globalIndex}
                  onSelect={() => handleProjectSelect(globalIndex, elementId)}
                  id={elementId}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            {t("projects.noProjectsYet", {
              status: translatedTitle.toLowerCase(),
            })}
          </p>
        )}
      </section>
    );
  };

  return (
    <section className="flex flex-col items-center w-full px-0 py-20 bg-background">
      {renderProjectSection(
        "projects.completedProjectsTitle",
        previousProjects,
        "Completed",
        0
      )}
      {renderProjectSection(
        "projects.underConstructionTitle",
        currentProjects,
        "Under Construction",
        previousProjects.length
      )}
      {renderProjectSection(
        "projects.inDesignTitle",
        upcomingProjects,
        "In Design",
        previousProjects.length + currentProjects.length
      )}
    </section>
  );
}
