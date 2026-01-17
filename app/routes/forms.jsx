import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const shop = new URL(request.url).searchParams.get("shop");
  if (!shop) return json([]);
  return json(
    await prisma.form.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    })
  );
};

export const action = async ({ request }) => {
  const data = await request.json();

  const form = await prisma.form.upsert({
    where: { id: data.id ?? "" },
    update: {
      title: data.title,
      questions: data.questions,
      settings: data.settings,
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
