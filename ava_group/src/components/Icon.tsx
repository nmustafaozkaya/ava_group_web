import { Building, HardHat, Pencil, LucideProps } from "lucide-react";

const icons = {
  building: Building,
  "hard-hat": HardHat,
  pencil: Pencil,
};

export const Icon = ({
  name,
  ...props
}: { name: keyof typeof icons } & LucideProps) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};
