// app/routes/api.responses.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    // 🔐 Authenticate Shopify admin
    const { session } = await authenticate.admin(request);

    if (!session || !session.shop) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const shop = session.shop;
    console.log("CURRENT SHOP:", shop);

    // 📥 Fetch responses for this shop only
    const responses = await prisma.response.findMany({
      where: {
        form: {
          shop: shop,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        form: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log("RESPONSES FOUND:", responses.length);

    // 🧼 Shape data for frontend
    const formattedResponses = responses.map((r) => ({
      id: r.id,
      formId: r.formId,
      formTitle: r.form?.title ?? "Untitled Form",
      answers: r.answers,
      email: r.answers?.email || r.answers?.Email || null,
      createdAt: r.createdAt.toISOString(),
    }));

    return json(formattedResponses, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return json({ error: "Failed to fetch responses" }, { status: 500 });
  }
};