// src/app/admin/layout.tsx

export const metadata = {
  title: "Admin Paneli | AVA GROUP",
  description: "Yönetim arayüzü - AVA GROUP",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
