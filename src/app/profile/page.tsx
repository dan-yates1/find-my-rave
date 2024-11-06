import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { PrismaClient } from "@prisma/client";
import ProfileContent from "./ProfileContent";

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login-register");
  }

  // Fetch fresh user data from the database
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? '' },
  });

  if (!user) {
    redirect("/login-register");
  }

  return <ProfileContent user={user} />;
} 