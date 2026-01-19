// app/routes/api.public.submit.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", // Allows submissions from any Shopify store
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { formId, answers } = body;

    if (!formId || !answers) {
      return json({ error: "Missing required fields" }, { status: 400, headers });
    }

    // Save to the Response model
    await prisma.response.create({
      data: {
        formId: formId,
        answers: answers, // Stores the JSON object directly
      },
    });

    return json({ success: true }, { headers });
  } catch (error) {
    console.error("Submission Error:", error);
    return json({ error: "Database error" }, { status: 500, headers });
  }
};