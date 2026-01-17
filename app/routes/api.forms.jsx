import { json } from "@remix-run/node";
import prisma from "../db.server";

// GET -> Load forms | DELETE -> Remove form | POST -> Save/Update
export const loader = async () => {
  return json(await prisma.form.findMany({ orderBy: { createdAt: "desc" } }));
};

export const action = async ({ request }) => {
  const method = request.method;

  if (method === "DELETE") {
    const { id } = await request.json();
    await prisma.form.delete({ where: { id } });
    return json({ success: true });
  }

  const data = await request.json();
  if (!data.title || !data.questions) {
    return json({ error: "Missing data" }, { status: 400 });
  }

  // UPSERT: Update if ID exists, otherwise create
  const form = await prisma.form.upsert({
    where: { id: data.id || "" },
    update: {
      title: data.title,
      questions: data.questions,
      settings: data.settings,
      status: data.status || "Active",
    },
    create: {
      title: data.title,
      shop: data.shop,
      questions: data.questions,
      settings: data.settings,
    },
  });

  return json(form);
};