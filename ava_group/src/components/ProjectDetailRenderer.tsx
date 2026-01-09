// ProjectDetailRenderer.tsx
"use client";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRef, useState, useCallback, useEffect } from "react";
import styles from "../style/Projects.module.css";

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

export default function ProjectDetailRenderer({ project, details }: Props) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const isMobile = useIsMobile();

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

      if (typeof localizedText === "string") {
        return localizedText;
      }
      if (typeof fallbackText === "string") {
        return fallbackText;
      }
      return "";
    },
    [currentLocale]
  );

  const getDetailContent = useCallback(
    (detail: ProjectDetailFromDb): string => {
      if (detail.type === "text") {
        return getLocalizedText(detail, "content");
      } else {
        return detail.content || "";
      }
    },
    [getLocalizedText]
  );

  // Google Maps URL'sinin geçerli olup olmadığını kontrol eden fonksiyon
  const isValidGoogleMapsEmbedUrl = useCallback((url: string): boolean => {
    return (
      url.includes("google.com/maps/embed") ||
      url.includes("maps.google.com/maps/embed")
    );
  }, []);

  // Desktop için scroll ve cursor işlemleri
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<"left" | "right" | "default">(
    "default"
  );
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const naturalImageWidth = 1200;
  const naturalImageHeight = 750;

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return; // Mobilde mouse işlemleri devre dışı

      const container = scrollContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const containerWidth = rect.width;
      const activationZoneWidth = containerWidth * 0.15;
      if (mouseX < activationZoneWidth) {
        setCursorState("left");
      } else if (mouseX > containerWidth - activationZoneWidth) {
        setCursorState("right");
      } else {
        setCursorState("default");
      }
    },
    [isMobile]
  );

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setCursorState("default");
    isDraggingRef.current = false;
  }, [isMobile]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;

      const container = scrollContainerRef.current;
      if (!container || cursorState !== "default") return;
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: event.pageX,
        scrollLeft: container.scrollLeft,
      };
    },
    [cursorState, isMobile]
  );

  const handleMouseMoveGlobal = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;

      handleMouseMove(event);
      if (!isDraggingRef.current || cursorState !== "default") return;
      const container = scrollContainerRef.current;
      if (!container) return;
      const x = event.pageX;
      const walk = (x - dragStartRef.current.x) * 2;
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

    const container = scrollContainerRef.current;
    if (!container || isDraggingRef.current) return;
    const scrollAmount = container.clientWidth * 0.7;
    if (cursorState === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else if (cursorState === "right") {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
    setIsExpanded(true);
  }, [cursorState, isMobile]);

  const cursorClass = isMobile
    ? ""
    : {
        left: styles.cursorLeft,
        right: styles.cursorRight,
        default: isDraggingRef.current
          ? styles.cursorGrabbing
          : styles.cursorDefault,
      }[cursorState];

  // Mobil layout - yatay scroll
  if (isMobile) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-row gap-8 w-max px-4 py-6">
          {/* Ana Görsel - Mobilde ilk sırada */}
          <div className="w-[400px] h-[280px] relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
            <Image
              quality={100}
              src={project.src}
              alt={project.alt}
              width={naturalImageWidth}
              height={naturalImageHeight}
              className="w-full h-full object-cover"
              priority
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            />
          </div>

          {/* Sol Panel - Mobilde ikinci sırada */}
          <div className="w-[280px] flex-shrink-0 flex flex-col space-y-4">
            {project.icon && (
              <Image
                quality={100}
                src={project.icon}
                alt="project icon"
                width={40}
                height={40}
                className="mb-2 project-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                }}
              />
            )}
            <h3 className="text-xl font-bold text-foreground">
              {getLocalizedText(project, "leftTitle")}
            </h3>
            <p className="text-base text-muted-foreground">
              {getLocalizedText(project, "location")}, {project.year}
            </p>

            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                {t("structured_info.client")}
              </p>
              <p className="text-foreground text-base">
                {getLocalizedText(project, "client")}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                {t("structured_info.typology")}
              </p>
              <p className="text-foreground text-sm">
                {getLocalizedText(project, "typology")}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                {t("structured_info.status")}
              </p>
              <p className="text-foreground text-sm">
                {t(`status.${project.status}`, { fallback: project.status })}
              </p>
            </div>
          </div>

          {/* Açıklama - Üçüncü panel */}
          <div className="w-[300px] flex-shrink-0 flex flex-col">
            <h4 className="text-sm font-semibold mb-3 text-primary">
              {t("structured_info.details_title")}
            </h4>
            <p className="text-muted-foreground whitespace-pre-wrap text-xs leading-relaxed">
              {getLocalizedText(project, "description")}
            </p>
          </div>

          {/* Detaylar - Yan yana devam eder */}
          {details.map((detail, index) => (
            <div
              key={index}
              className="w-[380px] flex-shrink-0 space-y-3 flex flex-col"
            >
              {getLocalizedText(detail, "title") && (
                <h5 className="font-semibold text-foreground text-base">
                  {getLocalizedText(detail, "title")}
                </h5>
              )}

              {detail.type === "image" && (
                <div className="relative w-full h-[320px] rounded-lg overflow-hidden">
                  <Image
                    quality={100}
                    src={getDetailContent(detail)}
                    alt={getLocalizedText(detail, "title") || ""}
                    fill
                    className="object-cover"
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              )}

              {detail.type === "video" && (
                <div className="relative w-full h-[320px] rounded-lg overflow-hidden">
                  <video
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    src={getDetailContent(detail)}
                  >
                    Video desteklenmiyor.
                  </video>
                </div>
              )}

              {detail.type === "text" && (
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {getDetailContent(detail)}
                </p>
              )}

              {detail.type === "location" && (
                <div className="w-full space-y-3">
                  {getDetailContent(detail) &&
                  isValidGoogleMapsEmbedUrl(getDetailContent(detail)) ? (
                    <div className="relative w-full h-[240px] rounded-lg overflow-hidden border-2 border-gray-200">
                      <iframe
                        src={getDetailContent(detail)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={
                          getLocalizedText(detail, "title") || "Proje Konumu"
                        }
                        className="w-full h-full"
                      />
                    </div>
                  ) : getDetailContent(detail) ? (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">
                        {t("location.view_on_maps") || "Haritada görüntüle"}:
                      </p>
                      <a
                        href={getDetailContent(detail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {t("location.open_maps") || "Google Maps'te Aç"}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-500 text-xs">
                      {t("location.no_location") ||
                        "Konum bilgisi mevcut değil"}
                    </div>
                  )}

                  {getLocalizedText(detail, "content") && (
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <p className="text-blue-800 text-xs">
                        {getLocalizedText(detail, "content")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop layout (orijinal kod)
  return (
    <div
      ref={scrollContainerRef}
      className={`${styles.scrollWrapper} ${cursorClass}`}
      onMouseMove={handleMouseMoveGlobal}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <div
        className={`flex flex-row gap-8 w-max ${
          isExpanded ? "px-0 pb-0" : "px-4 pb-4"
        } pr-0`}
      >
        {/* Sol Panel */}
        <div
          className={`w-[250px] flex-shrink-0 flex flex-col space-y-4 pt-8 pl-8 ${styles.animatedSlideInLeft}`}
          style={{ animationDelay: "0.1s" }}
        >
          {project.icon && (
            <Image
              quality={100}
              src={project.icon}
              alt="project icon"
              width={40}
              height={40}
              className="mb-4"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
              }}
            />
          )}
          <h3 className="text-2xl font-bold text-foreground">
            {getLocalizedText(project, "leftTitle")}
          </h3>
          <p className="text-lg text-muted-foreground">
            {getLocalizedText(project, "location")}, {project.year}
          </p>

          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
              {t("structured_info.client")}
            </p>
            <p className="text-foreground">
              {getLocalizedText(project, "client")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
              {t("structured_info.typology")}
            </p>
            <p className="text-foreground">
              {getLocalizedText(project, "typology")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
              {t("structured_info.status")}
            </p>
            <p className="text-foreground">
              {t(`status.${project.status}`, { fallback: project.status })}
            </p>
          </div>
        </div>

        {/* Orta Görsel */}
        <div
          className={`w-[700px] h-[480px] relative flex-shrink-0 rounded-xl overflow-hidden shadow-xl ${styles.animatedFadeIn}`}
          style={{ animationDelay: "0.2s" }}
        >
          <Image
            quality={100}
            src={project.src}
            alt={project.alt}
            width={naturalImageWidth}
            height={naturalImageHeight}
            className="w-full h-full object-cover"
            priority
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* Sağ İçerikler */}
        <div
          className={`flex flex-row gap-6 flex-shrink-0 ${styles.animatedSlideInRight}`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="w-[450px] flex-shrink-0 flex flex-col">
            <h4 className="text-lg font-semibold mb-2 text-primary">
              {t("structured_info.details_title")}
            </h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {getLocalizedText(project, "description")}
            </p>
          </div>

          {details.map((detail, index) => (
            <div
              key={index}
              className={`w-[700px] flex-shrink-0 space-y-3 flex flex-col ${styles.animatedFadeIn}`}
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              {getLocalizedText(detail, "title") && (
                <h5 className="font-semibold text-foreground">
                  {getLocalizedText(detail, "title")}
                </h5>
              )}

              {detail.type === "image" && (
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <Image
                    quality={100}
                    src={getDetailContent(detail)}
                    alt={getLocalizedText(detail, "title") || ""}
                    fill
                    className="object-cover"
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              )}

              {detail.type === "video" && (
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <video
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    src={getDetailContent(detail)}
                  >
                    Video desteklenmiyor.
                  </video>
                </div>
              )}

              {detail.type === "text" && (
                <p className="text-muted-foreground whitespace-pre-wrap w-fit max-w-[600px]">
                  {getDetailContent(detail)}
                </p>
              )}

              {detail.type === "location" && (
                <div className="w-full space-y-6">
                  {getDetailContent(detail) &&
                  isValidGoogleMapsEmbedUrl(getDetailContent(detail)) ? (
                    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
                      <iframe
                        src={getDetailContent(detail)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={
                          getLocalizedText(detail, "title") || "Proje Konumu"
                        }
                        className="w-full h-full"
                      />
                    </div>
                  ) : getDetailContent(detail) ? (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 mb-2">
                        {t("location.view_on_maps") || "Haritada görüntüle"}:
                      </p>
                      <a
                        href={getDetailContent(detail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {t("location.open_maps") || "Google Maps'te Aç"}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                      {t("location.no_location") ||
                        "Konum bilgisi mevcut değil"}
                    </div>
                  )}
                  {getLocalizedText(detail, "content") && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        {getLocalizedText(detail, "content")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
