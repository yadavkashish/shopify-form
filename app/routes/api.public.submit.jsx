// app/routes/api.public.submit.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. Critical Fix: Respond to CORS pre-flight with 204 No Content
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const body = await request.json();
    const { formId, answers } = body;

    if (!formId || !answers) {
      return json({ error: "Missing required fields" }, { status: 400, headers });
    }

    await prisma.response.create({
      data: {
        formId: formId,
        answers: answers, 
      },
    });

    return json({ success: true }, { headers });
  } catch (error) {
    console.error("Submission Error:", error);
   
    return json({ error: "Database error", details: error.message }, { status: 500, headers });
  }
};