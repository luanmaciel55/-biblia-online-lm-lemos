import { NextResponse } from "next/server";

const INFINITEPAY_HANDLE = "luanmacielxx";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    const price = Math.round(amount * 100);
    const origin = new URL(request.url).origin;
    const orderNsu = `biblia-doacao-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: INFINITEPAY_HANDLE,
        order_nsu: orderNsu,
        redirect_url: `${origin}/?doacao=obrigado`,
        items: [{ quantity: 1, price, description: "Contribuição voluntária — Bíblia Online L.M. Lemos" }]
      }),
      cache: "no-store"
    });

    const data = await response.json();
    if (!response.ok || typeof data?.url !== "string" || !data.url.startsWith("https://")) {
      return NextResponse.json({ error: "Não foi possível criar o pagamento." }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o pagamento." }, { status: 500 });
  }
}
