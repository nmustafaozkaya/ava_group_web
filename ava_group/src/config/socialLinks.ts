import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaFacebook,
} from "react-icons/fa";
import type { IconType } from "react-icons";

export interface SocialLink {
  href: string;
  label: string;
  icon: IconType;
  color: string;
}

export const socialLinks: SocialLink[] = [
  {
    href: "https://www.instagram.com/avagroup",
    label: "Instagram",
    icon: FaInstagram,
    color: "#E4405F",
  },
  {
    href: "https://www.youtube.com/@avagroup",
    label: "YouTube",
    icon: FaYoutube,
    color: "#FF0000",
  },
  {
    href: "https://www.tiktok.com/@avagroup",
    label: "TikTok",
    icon: FaTiktok,
    color: "#000000",
  },
  {
    href: "https://www.facebook.com/avagroup",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877F2",
  },
 
];
