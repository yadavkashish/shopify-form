import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server"; // Step 1: Import authenticate

// GET -> Load forms ONLY for the authenticated shop
export const loader = async ({ request }) => {
  // Step 2: Get the secure session
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Step 3: Add the 'where' filter
  const forms = await prisma.form.findMany({ 
    where: { shop: shop }, 
    orderBy: { createdAt: "desc" } 
  });

  return json(forms);
};

export const action = async ({ request }) => {
  // Step 4: Secure the action as well
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const method = request.method;

  if (method === "DELETE") {
    const { id } = await request.json();
    // Only delete if the form belongs to this shop
    await prisma.form.deleteMany({ 
      where: { id: id, shop: shop } 
    });
    return json({ success: true });
  }

  const data = await request.json();
  if (!data.title || !data.questions) {
    return json({ error: "Missing data" }, { status: 400 });
  }

  // UPSERT: Ensure the shop domain is always set to the authenticated session shop
  const form = await prisma.form.upsert({
    where: { id: data.id || "" },
    update: {
      title: data.title,
      questions: data.questions,
      settings: data.settings,
      status: data.status || "Active",
      // Never update the 'shop' field here to prevent domain spoofing
    },
    create: {
      title: data.title,
      shop: shop, // Use the secure shop from the session
      questions: data.questions,
      settings: data.settings,
    },
  });

  return json(form);
};