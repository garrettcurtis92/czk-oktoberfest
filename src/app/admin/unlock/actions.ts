"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function unlockAction(formData: FormData) {
  const key = String(formData.get("key") || "");
  const next = String(formData.get("next") || "/admin");

  if (!process.env.ADMIN_KEY) {
    throw new Error("ADMIN_KEY missing on server");
  }

  if (key === process.env.ADMIN_KEY) {
    const jar = await cookies();
    jar.set("czk_admin", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    redirect(next);
  }

  redirect(`/admin/unlock?error=1&next=${encodeURIComponent(next)}`);
}

export async function logoutAction() {
  const jar = await cookies();
  jar.set("czk_admin", "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  redirect("/");
}
