import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. Handle Pre-flight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const body = await request.json();
    const { formId, answers } = body;

    // 2. Check Database Connection & Form Existence
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return json({ error: "Form not found. Check your Form ID." }, { status: 404, headers });
    }

    // 3. Save Response
    await prisma.response.create({
      data: {
        formId: formId,
        answers: JSON.stringify(answers), // Ensure matching schema type
      },
    });

    return json({ success: true }, { headers });

  } catch (error) {
    console.error("Submission Error:", error);
    // CRITICAL: Must return headers here so the browser doesn't block the error message
    return json({ 
      error: "Server Error", 
      details: error.message 
    }, { status: 500, headers });
  }
};