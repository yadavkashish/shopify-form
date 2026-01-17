// app/routes/api.public.form.$id.jsx
import { json } from "@remix-run/node";
import prisma from "../../db.server";
import { cors } from "remix-utils/cors";

export const loader = async ({ request, params }) => {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
  });

  if (!form) return json({ error: "Form not found" }, { status: 404 });

  const response = json(form);
  // Allow the storefront to fetch this data
  return await cors(request, response);
};