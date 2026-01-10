import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "./context/AuthContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
