import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // if (!session || !session.user || !("role" in session.user) || session.user.role !== "admin") {
  //   console.log("Redirecting to home page due to insufficient permissions or missing session.");
  //   redirect("/");
  // }

  return <AdminDashboard />;
}
