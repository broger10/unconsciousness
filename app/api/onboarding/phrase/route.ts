import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateFirstRevealPhrase } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { sunSign, moonSign, risingSign } = await req.json();

  if (!sunSign || !moonSign || !risingSign) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const phrase = await generateFirstRevealPhrase(sunSign, moonSign, risingSign);
  return NextResponse.json({ phrase });
}
