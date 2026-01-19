import { json } from "@remix-run/node";
import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const loader = async ({ request }) => {
  // 👈 THIS is the missing piece
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return json({ error: "Not allowed" }, { status: 405, headers: corsHeaders });
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { formId, answers } = body;

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return json(
        { error: "Form not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.response.create({
      data: {
        formId,
        answers: JSON.stringify(answers),
      },
    });

    return json({ success: true }, { headers: corsHeaders });

  } catch (error) {
    console.error("Submission Error:", error);
    return json(
      { error: "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
