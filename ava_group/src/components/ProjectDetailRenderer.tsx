// ProjectDetailRenderer.tsx
"use client";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRef, useState, useCallback } from "react";
import styles from "../style/Projects.module.css";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ProjectDetailFromDb {
  id: number;
  type: "image" | "text" | "video" | "location";
  content?: string;
  content_tr?: string | null;
  content_en?: string | null;
  content_ar?: string | null;
  title_en: string | null;
  title_tr: string | null;
  title_ar: string | null;
  projectId: number;
}

interface ProjectDataFromDb {
  id: number;
  src: string;
  alt: string;
  status: "COMPLETED" | "UNDER_CONSTRUCTION" | "IN_DESIGN";
  icon: string | null;
  year: number;
  leftTitle_en: string;
  leftTitle_tr: string;
  leftTitle_ar: string | null;
  description_en: string;
  description_tr: string;
  description_ar: string | null;
  location_en: string;
  location_tr: string;
  location_ar: string | null;
  client_en: string;
  client_tr: string;
  client_ar: string | null;
  typology_en: string;
  typology_tr: string;
  typology_ar: string | null;
  details: ProjectDetailFromDb[];
}

interface Props {
  project: ProjectDataFromDb;
  details: ProjectDetailFromDb[];
}

/* ─── BIG.dk–style meta row ─── */
function MetaItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a] mb-[3px]">
        {label}
      </p>
      <p className="text-xs uppercase tracking-wide text-foreground leading-tight">
        {value}
      </p>
    </div>
  );
}

/* ─── Google Maps URL validator ─── */
function isValidMapsEmbed(url: string) {
  return (
    url.includes("google.com/maps/embed") ||
    url.includes("maps.google.com/maps/embed")
  );
}

export default function ProjectDetailRenderer({ project, details }: Props) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const isMobile = useIsMobile();

  /* ── Localisation helper ── */
  const getLocalizedText = useCallback(
    <T extends ProjectDataFromDb | ProjectDetailFromDb>(
      obj: T,
      baseKey:
        | "leftTitle"
        | "description"
        | "location"
        | "client"
        | "typology"
        | "title"
        | "content"
    ): string => {
      const localizedKey = `${baseKey}_${currentLocale}` as keyof T;
      const localizedText = obj[localizedKey];
      const fallbackKey = `${baseKey}_en` as keyof T;
      const fallbackText = obj[fallbackKey];

      if (typeof localizedText === "string") return localizedText;
      if (typeof fallbackText === "string") return fallbackText;
      return "";
    },
    [currentLocale]
  );

  const getDetailContent = useCallback(
    (detail: ProjectDetailFromDb): string => {
      if (detail.type === "text") return getLocalizedText(detail, "content");
      return detail.content || "";
    },
    [getLocalizedText]
  );

  /* ── Desktop drag-scroll state ── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<"left" | "right" | "default">(
    "default"
  );
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;
      const container = scrollRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const zone = rect.width * 0.15;
      if (x < zone) setCursorState("left");
      else if (x > rect.width - zone) setCursorState("right");
      else setCursorState("default");
    },
    [isMobile]
  );

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setCursorState("default");
    isDraggingRef.current = false;
  }, [isMobile]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || cursorState !== "default") return;
      const container = scrollRef.current;
      if (!container) return;
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.pageX, scrollLeft: container.scrollLeft };
    },
    [cursorState, isMobile]
  );

  const handleMouseMoveGlobal = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;
      handleMouseMove(e);
      if (!isDraggingRef.current || cursorState !== "default") return;
      const container = scrollRef.current;
      if (!container) return;
      const walk = (e.pageX - dragStartRef.current.x) * 2;
      container.scrollLeft = dragStartRef.current.scrollLeft - walk;
    },
    [handleMouseMove, cursorState, isMobile]
  );

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;
    isDraggingRef.current = false;
  }, [isMobile]);

  const handleClick = useCallback(() => {
    if (isMobile) return;
    const container = scrollRef.current;
    if (!container || isDraggingRef.current) return;
    const amt = container.clientWidth * 0.7;
    if (cursorState === "left")
      container.scrollBy({ left: -amt, behavior: "smooth" });
    else if (cursorState === "right")
      container.scrollBy({ left: amt, behavior: "smooth" });
  }, [cursorState, isMobile]);

  const cursorClass = isMobile
    ? ""
    : { left: styles.cursorLeft, right: styles.cursorRight, default: isDraggingRef.current ? styles.cursorGrabbing : styles.cursorDefault }[cursorState];

  /* ────────────────────────────────────────────
     Left panel shared between mobile & desktop
  ──────────────────────────────────────────── */
  const LeftPanel = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`flex flex-col gap-5 ${
        compact
          ? "w-full"
          : "w-[220px] flex-shrink-0 self-start pt-8 pl-8 pr-4"
      }`}
    >
      {/* Icon */}
      {project.icon && (
        <div className="w-10 h-10 relative flex-shrink-0">
          <Image
            src={project.icon}
            alt="project icon"
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* Title + location */}
      <div>
        <h3 className="text-[18px] leading-[20px] font-normal text-foreground">
          {getLocalizedText(project, "leftTitle")}
        </h3>
        <p className="mt-1 text-[12px] text-[#797979] dark:text-[#9a9a9a] uppercase tracking-wide">
          {getLocalizedText(project, "location")}, {project.year}
        </p>
      </div>

      {/* Meta grid */}
      <div className="flex flex-col gap-3">
        <MetaItem
          label={t("structured_info.client")}
          value={getLocalizedText(project, "client")}
        />
        <MetaItem
          label={t("structured_info.typology")}
          value={getLocalizedText(project, "typology")}
        />
        <MetaItem
          label={t("structured_info.status")}
          value={t(`status.${project.status}`, { fallback: project.status })}
        />
      </div>
    </div>
  );

  /* ─── Detail item renderer (shared) ─── */
  const renderDetail = (detail: ProjectDetailFromDb, index: number) => {
    const title = getLocalizedText(detail, "title");
    const content = getDetailContent(detail);

    return (
      <div
        key={index}
        className={`flex-shrink-0 flex flex-col gap-3 ${
          isMobile ? "w-[85vw]" : "w-[680px]"
        }`}
      >
        {/* Title label */}
        {title && (
          <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a]">
            {title}
          </p>
        )}

        {detail.type === "image" && content && (
          <div
            className={`relative rounded-sm overflow-hidden ${
              isMobile ? "w-full h-[260px]" : "w-full h-[500px]"
            }`}
          >
            <Image
              quality={90}
              src={content}
              alt={title || ""}
              fill
              className="object-cover"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        )}

        {detail.type === "video" && content && (
          <div
            className={`relative rounded-sm overflow-hidden ${
              isMobile ? "w-full h-[260px]" : "w-full h-[500px]"
            }`}
          >
            <video
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              src={content}
            />
          </div>
        )}

        {detail.type === "text" && content && (
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-w-[520px]">
            {content}
          </p>
        )}

        {detail.type === "location" && (
          <div className="space-y-3">
            {content && isValidMapsEmbed(content) ? (
              <div
                className={`relative rounded-sm overflow-hidden border border-border ${
                  isMobile ? "w-full h-[220px]" : "w-full h-[460px]"
                }`}
              >
                <iframe
                  src={content}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={title || t("structured_info.status")}
                  className="w-full h-full"
                />
              </div>
            ) : content ? (
              <div className="bg-muted/50 p-3 rounded-sm border border-border">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
                  {t("location.view_on_maps")}
                </p>
                <a
                  href={content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-sm text-xs uppercase tracking-wide hover:opacity-80 transition-opacity"
                >
                  {t("location.open_maps")}
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {t("location.no_location")}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────
     MOBILE LAYOUT
  ───────────────────── */
  if (isMobile) {
    return (
      <div className="w-full">
        {/* Hero image */}
        <div className="relative w-full h-[260px] overflow-hidden">
          <Image
            quality={90}
            src={project.src}
            alt={project.alt}
            fill
            className="object-cover"
            priority
            draggable="false"
          />
        </div>

        {/* Left panel as inline block */}
        <div className="px-5 py-6 border-b border-border">
          <LeftPanel compact />
        </div>

        {/* Description */}
        {getLocalizedText(project, "description") && (
          <div className="px-5 py-6 border-b border-border">
            <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a] mb-3">
              {t("structured_info.details_title")}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {getLocalizedText(project, "description")}
            </p>
          </div>
        )}

        {/* Detail items — horizontal scroll */}
        {details.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex flex-row gap-5 px-5 py-6 w-max">
              {details.map((detail, i) => renderDetail(detail, i))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────
     DESKTOP LAYOUT (BIG.dk style)
     Order: [Hero image] → [Meta panel centered] → [Description] → [Detail items...]
  ───────────────────── */
  return (
    <div
      ref={scrollRef}
      className={`${styles.scrollWrapper} ${cursorClass} h-[76vh]`}
      onMouseMove={handleMouseMoveGlobal}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <div className="flex flex-row items-stretch h-full w-max">

        {/* ── Meta panel — LEFT of hero, vertically centered ── */}
        <div className="flex-shrink-0 w-[260px] flex flex-col justify-center pl-12 pr-6 gap-5">
          {project.icon && (
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                src={project.icon}
                alt="project icon"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h3 className="text-[18px] leading-[22px] font-normal text-foreground">
              {getLocalizedText(project, "leftTitle")}
            </h3>
            <p className="mt-[6px] text-[11px] text-[#797979] dark:text-[#9a9a9a] uppercase tracking-wide">
              {getLocalizedText(project, "location")}, {project.year}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <MetaItem
              label={t("structured_info.client")}
              value={getLocalizedText(project, "client")}
            />
            <MetaItem
              label={t("structured_info.typology")}
              value={getLocalizedText(project, "typology")}
            />
            <MetaItem
              label={t("structured_info.status")}
              value={t(`status.${project.status}`, { fallback: project.status })}
            />
          </div>
        </div>

        {/* ── Hero image ── */}
        <div
          className="relative h-full flex-shrink-0 overflow-hidden"
          style={{ aspectRatio: "3303/2288" }}
        >
          <Image
            quality={90}
            src={project.src}
            alt={project.alt}
            fill
            className="object-cover"
            priority
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* ── Description text panel ── */}
        {getLocalizedText(project, "description") && (
          <div className="flex-shrink-0 w-[420px] flex flex-col justify-center px-10 gap-4 py-6">
            <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a] flex-shrink-0">
              {t("structured_info.details_title")}
            </p>
            <div className="overflow-y-auto max-h-[55vh] pr-2 scrollbar-thin">
              <blockquote className="text-[16px] leading-[1.6] text-foreground font-normal">
                {getLocalizedText(project, "description")}
              </blockquote>
            </div>
          </div>
        )}

        {/* ── Detail items ── */}
        {details.map((detail, i) => {
          const title = getLocalizedText(detail, "title");
          const content = getDetailContent(detail);

          if (detail.type === "image" && content) {
            return (
              <div key={i} className="flex-shrink-0 flex flex-col h-full">
                {title && (
                  <p className="px-8 pt-4 pb-2 text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a]">
                    {title}
                  </p>
                )}
                <div
                  className="relative flex-1 overflow-hidden"
                  style={{ aspectRatio: "3303/2288" }}
                >
                  <Image
                    quality={90}
                    src={content}
                    alt={title || ""}
                    fill
                    className="object-cover"
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            );
          }

          if (detail.type === "video" && content) {
            return (
              <div key={i} className="flex-shrink-0 h-full w-[900px] flex flex-col">
                {title && (
                  <p className="px-8 pt-4 pb-2 text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a]">
                    {title}
                  </p>
                )}
                <div className="flex-1 overflow-hidden">
                  <video
                    controls autoPlay muted loop playsInline
                    className="w-full h-full object-cover"
                    src={content}
                  />
                </div>
              </div>
            );
          }

          if (detail.type === "text" && content) {
            return (
              <div key={i} className="flex-shrink-0 w-[420px] flex flex-col justify-center px-10 gap-3 py-6">
                {title && (
                  <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a] flex-shrink-0">
                    {title}
                  </p>
                )}
                <div className="overflow-y-auto max-h-[55vh] pr-2 scrollbar-thin">
                  <p className="text-[15px] leading-[1.65] text-muted-foreground whitespace-pre-wrap">
                    {content}
                  </p>
                </div>
              </div>
            );
          }

          if (detail.type === "location") {
            return (
              <div key={i} className="flex-shrink-0 h-full w-[700px] flex flex-col">
                {title && (
                  <p className="px-8 pt-4 pb-2 text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a]">
                    {title}
                  </p>
                )}
                <div className="flex-1">
                  {content && isValidMapsEmbed(content) ? (
                    <iframe
                      src={content}
                      width="100%" height="100%"
                      style={{ border: 0 }}
                      allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={title || "Location"}
                      className="w-full h-full"
                    />
                  ) : content ? (
                    <div className="flex items-center justify-center h-full px-12">
                      <div className="text-center space-y-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#797979] dark:text-[#9a9a9a]">
                          {t("location.view_on_maps")}
                        </p>
                        <a
                          href={content} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-wide hover:opacity-80 transition-opacity"
                        >
                          {t("location.open_maps")}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t("location.no_location")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* ── Trailing spacer ── */}
        <div className="w-20 flex-shrink-0 h-full" />
      </div>
    </div>
  );
}
