export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { reorderArtworks } from "@/lib/db";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids = body?.ids;

  if (!Array.isArray(ids) || !ids.every((i) => typeof i === "string")) {
    return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
  }

  reorderArtworks(ids);
  return NextResponse.json({ ok: true });
}
