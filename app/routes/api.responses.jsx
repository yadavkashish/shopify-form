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
// --- ADD THIS TO app/routes/api.responses.jsx ---

export const action = async ({ request }) => {
  // 🔐 Authenticate the request
  const { session } = await authenticate.admin(request);
  
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return json({ error: "Missing form ID" }, { status: 400 });
    }

    // Verify the form belongs to this shop before deleting
    const form = await prisma.form.findFirst({
      where: { id: id, shop: session.shop }
    });

    if (!form) {
      return json({ error: "Form not found or unauthorized" }, { status: 404 });
    }

    // 1. Delete associated responses (Prisma requirement for foreign keys)
    await prisma.response.deleteMany({
      where: { formId: id },
    });

    // 2. Delete the form itself
    await prisma.form.delete({
      where: { id: id },
    });

    return json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Action Error:", error);
    return json({ error: "Failed to delete form" }, { status: 500 });
  }
};