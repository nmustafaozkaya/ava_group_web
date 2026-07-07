"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";

const languages = [
  { code: "tr", flag: "/icons/tr.png", label: "Türkçe" },
  { code: "en", flag: "/icons/en.png", label: "English" },
  { code: "ar", flag: "/icons/ar.png", label: "العربية" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (locale: string) => {
    if (locale === currentLocale) return;
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex gap-3 justify-center">
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          title={label}
          className={`relative w-9 h-9 rounded-full overflow-hidden transition-all duration-300 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            currentLocale === code
              ? "opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "opacity-50 hover:opacity-75"
          }`}
        >
          <Image
            src={flag}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 10vw, 5vw"
          />
        </button>
      ))}
    </div>
  );
}
