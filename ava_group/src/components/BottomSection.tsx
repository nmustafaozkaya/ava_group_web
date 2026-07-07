"use client";
import { RefObject, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import ProjectDetailRenderer from "./ProjectDetailRenderer";
import { useIsMobile } from "@/hooks/useIsMobile";

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

  const getLocalizedText = useCallback(
    (baseKey: string): string => {
      const localizedKey = `${baseKey}_${currentLocale}` as keyof ProjectData;
      const localizedText = project[localizedKey];
      const fallbackKey = `${baseKey}_en` as keyof ProjectData;
      const fallbackText = project[fallbackKey];
      if (typeof localizedText === "string" && localizedText) return localizedText;
      if (typeof fallbackText === "string") return fallbackText;
      return "";
    },
    [currentLocale, project]
  );

  const leftTitle = getLocalizedText("leftTitle");
  const shouldShowDetail = isMobile || isSelected;

  return (
    <div
      id={id}
      className={`relative transition-all duration-700 ease-in-out ${
        shouldShowDetail ? "mb-20 max-w-full" : "mb-8 max-w-full"
      }`}
    >
      {shouldShowDetail ? (
        <ProjectDetailRenderer
          project={project}
          details={project.details || []}
        />
      ) : (
        /* ── Centered card wrapper ── */
        <div
          onClick={onSelect}
          className="group flex flex-row items-center justify-center cursor-pointer hover:bg-muted/10 transition-colors duration-200 w-full py-6"
        >
          {/* Centered target zone of exactly the thumbnail's width */}
          <div className="relative flex items-center justify-center w-[340px] h-[210px]">
            
            {/* Metadata (Absolutely positioned to the left of the centered thumbnail) */}
            <div className="absolute right-[calc(100%+2.5rem)] flex flex-col items-end text-right w-[280px] gap-2 select-none">
              {project.icon && (
                <div className="w-8 h-8 relative flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Image
                    src={project.icon}
                    alt="project icon"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="text-[15px] font-normal text-foreground leading-snug">
                  {leftTitle}
                </h3>
                <p className="text-[11px] text-[#797979] dark:text-[#9a9a9a] uppercase tracking-wide mt-0.5">
                  {getLocalizedText("location")}, {project.year}
                </p>
              </div>
            </div>

            {/* Thumbnail (Exactly centered) */}
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              <Image
                src={project.src}
                alt={project.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                draggable="false"
              />
            </div>
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
        className="w-full max-w-[1920px] mx-auto mb-24 scroll-mt-24 flex flex-col"
      >
        {/* BIG.dk-style section header: small uppercase */}
        <div className="flex items-center gap-4 px-10 py-4 border-t border-border mb-2">
          <h2 className="text-[11px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a] font-normal">
            {translatedTitle}
          </h2>
        </div>
        {projectsToRender.length > 0 ? (
          <div className="flex flex-col">
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
