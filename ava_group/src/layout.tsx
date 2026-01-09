export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        {/* Global context veya genel provider */}
        {children}
      </body>
    </html>
  );
}
