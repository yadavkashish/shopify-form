import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ params, request }) => {
  // 1. Fetch the form from the database
  const form = await prisma.form.findUnique({
    where: { id: params.id },
  });

  if (!form) {
    return json({ error: "Form not found" }, { status: 404 });
  }

  // 2. Set CORS headers so the storefront can access the data
  const headers = {
    "Access-Control-Allow-Origin": "*", // Allows any store to fetch the form
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 3. Handle 'OPTIONS' preflight requests (browsers send this before the actual GET)
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  return json(form, { headers });
};