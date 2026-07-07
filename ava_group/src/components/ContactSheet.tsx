"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Phone, Mail, MapPin } from "lucide-react";

interface ContactSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSheet({ open, onOpenChange }: ContactSheetProps) {
  const t = useTranslations("Navbar");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col z-[100]">
        <SheetHeader>
          <SheetTitle>{t("contactInfoTitle")}</SheetTitle>
          <SheetDescription>{t("contactSubtitle")}</SheetDescription>
        </SheetHeader>

        {/* Harita yukarı alındı */}
        <div className="mt-4 h-40 sm:h-48 w-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3250.083006686996!2d37.356759664541045!3d37.01443276463741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e1f30af29833%3A0x87fd869111795391!2zxZ5haGluYmV5IE1pbGxldCBLw7x0w7xwaGFuZXNp!5e0!3m2!1str!2str!4v1754482581641!5m2!1str!2str"
            width="100%"
            height="100%"
            className="rounded-lg"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Konum Haritası"
          />
        </div>

        {/* İletişim bilgileri en sona alındı */}
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-3">
            <Phone size={16} />
            <a href="tel:+905555555555" className="hover:underline">
              {t("phone")}: +90 555 555 55 55
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Mail size={16} />
            <a href="mailto:info@site.com" className="hover:underline">
              {t("email")}: info@site.com
            </a>
          </p>
          <p className="flex items-center gap-3">
            <MapPin size={16} />
            <span>{t("address")}: Gaziantep, Türkiye</span>
          </p>
          <a
            href="https://maps.google.com?q=Gaziantep"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-primary underline"
          >
            <MapPin size={16} />
            <span>{t("clickForLocation")}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
