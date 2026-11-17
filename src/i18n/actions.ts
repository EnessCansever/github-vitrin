"use server";

import { cookies } from "next/headers";
import {redirect} from "next/navigation";
import { revalidatePath } from "next/cache";

export async function setLocale(formData: FormData) {
  const locale = formData.get("locale");
  if (locale !== "tr" && locale !== "en") return;

  (await cookies()).set("locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  const shareId=formData.get("shareId");
  if(typeof shareId==="string" && /^[a-f\d]{48}$/.test(shareId)) redirect(`/share/${shareId}?lang=${locale}`);
}
