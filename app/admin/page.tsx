import { isAdminAuthenticated } from "@/lib/auth";
import { listArtworks } from "@/lib/db";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — WHITE F.P.G",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin />;
  }

  const artworks = listArtworks();
  return <AdminDashboard initialArtworks={artworks} />;
}
