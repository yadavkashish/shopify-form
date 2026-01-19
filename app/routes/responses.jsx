import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  // 1️⃣ Get current shop from Shopify session
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // 2️⃣ Fetch responses for THIS shop only
  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      form: {
        shop: shop,
      },
    },
    include: {
      form: {
        select: { title: true },
      },
    },
  });

  console.log("RESPONSES FOR SHOP:", shop, responses.length);

  // 3️⃣ Shape data for UI
  const formatted = responses.map(r => ({
    id: r.id,
    formId: r.formId,
    formTitle: r.form.title,
    answers: r.answers,
    email: r.answers?.email || r.answers?.Email || null,
    createdAt: r.createdAt,
  }));

  return json(formatted);
};
