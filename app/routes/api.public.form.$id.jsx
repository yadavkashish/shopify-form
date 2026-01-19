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

  // 1. Handle OPTIONS pre-flight (Browsers send this before the actual GET)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 2. Fetch the form
    const form = await prisma.form.findUnique({
      where: { id: params.id },
    });

    if (!form) {
      console.error(`Formify: Form with ID ${params.id} not found.`);
      return json({ error: "Form not found" }, { status: 404, headers });
    }

    // 3. Return the form data with CORS headers
    return json(form, { headers });

  } catch (error) {
    console.error("Formify Loader Error:", error);
    // Return 500 with headers so the browser doesn't block the error message
    return json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500, headers }
    );
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