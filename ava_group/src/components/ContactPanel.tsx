"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { MessageSquare, X, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations("contactus");

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  if (isMobile) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t("triggerButton")}
          className="contact-fab"
        >
          <MessageSquare className="h-6 w-6" />
          <span>{t("triggerButton")}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-[110] w-[380px] h-[480px] bg-card text-card-foreground rounded-2xl shadow-2xl border flex flex-col animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8 text-muted-foreground"
            onClick={() => setIsOpen(false)}
            aria-label={t("close")}
          >
            <X size={20} />
          </Button>
          <div className="w-full h-1/2 flex-shrink-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3250.083006686996!2d37.356759664541045!3d37.01443276463741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e1f30af29833%3A0x87fd869111795391!2zxZ5haGluYmV5IE1pbGxldCBLw7x0w7xwaGFuZXNp!5e0!3m2!1str!2str!4v1754482581641!5m2!1str!2str"
              width="100%"
              height="100%"
              className="rounded-t-2xl"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Konum Haritası"
            />
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              {t("panelTitle")}
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+905555555555" className="hover:underline">
                  {t("phone")}: +90 555 555 55 55
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:info@site.com" className="hover:underline">
                  {t("email")}: info@site.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{t("address")}: Gaziantep, Türkiye</span>
              </p>
              <a
                href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3250.083006686996!2d37.356759664541045!3d37.01443276463741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e1f30af29833%3A0x87fd869111795391!2zxZ5haGluYmV5IE1pbGxldCBLw7x0w7xwaGFuZXNp!5e0!3m2!1str!2str!4v1754482581641!5m2!1str!2str"
                target="_blank"
                rel="noreferrer"
                className="inline-block pt-2 font-medium text-primary underline underline-offset-4"
              >
                📌 {t("clickForLocation")}
              </a>
            </div>
            <Button
              variant="destructive"
              className="mt-auto"
              onClick={() => setIsOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              {t("close")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
