import { json } from "@remix-run/node";
import prisma from "../db.server";

// This function handles the CORS headers for all responses in this file
const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export const loader = async ({ params, request }) => {
  const headers = getCorsHeaders();
  const url = new URL(request.url);
  // Optional: Pass the shop as a query param to ensure 
  // we are pulling the form for the correct domain
  const expectedShop = url.searchParams.get("shop");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
    });

    // SAFETY CHECK: 
    // 1. Does the form exist?
    // 2. If a shop was provided in the URL, does it match the form's shop?
    if (!form || (expectedShop && form.shop !== expectedShop)) {
      return json({ error: "Form not found on this store" }, { status: 404, headers });
    }

    // 3. Ensure we only show "Active" forms to the public
    if (form.status !== "Active") {
       return json({ error: "This form is currently inactive" }, { status: 403, headers });
    }

    return json(form, { headers });
  } catch (error) {
    console.error("Formify Loader Error:", error);
    return json({ error: "Internal Server Error" }, { status: 500, headers });
  }
};

// If your Remix version requires an explicit action for OPTIONS
export const action = async ({ request }) => {
  const headers = getCorsHeaders();
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  return json({ error: "Method not allowed" }, { status: 405, headers });
};