export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createAdminSession,
  setAdminSessionCookie,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password mancante" }, { status: 400 });
  }

  const valid = await verifyAdminPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
  }

  const token = await createAdminSession();
  await setAdminSessionCookie(token);

  return NextResponse.json({ ok: true });
}
