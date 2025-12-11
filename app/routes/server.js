// server.js
import { json } from "@remix-run/node";
import prisma from "../db.server"; // adjust path if needed

/*  
  THIS ROUTE IS NOW PUBLIC  
  - GET  => Fetch a single form by ID (public)
  - POST => Submit a form response (public)
*/

// GET: Fetch a single form (PUBLIC)
export const loader = async ({ params }) => {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id }
    });

    if (!form) {
      return json({ error: "Form not found" }, { status: 404 });
    }

    // Parse questions if stored as string
    let questions = form.questions;
    try {
      questions = typeof questions === "string" ? JSON.parse(questions) : questions;
    } catch (err) {
      // leave as string if parsing fails
    }

    return json({
      id: form.id,
      title: form.title,
      questions,
      createdAt: form.createdAt
    });
  } catch (err) {
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
};

// POST: Submit form response (PUBLIC)
export const action = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.formId || !data.answers) {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    // Check if form exists (optional but good)
    const form = await prisma.form.findUnique({
      where: { id: data.formId }
    });

    if (!form) {
      return json({ error: "Form not found" }, { status: 404 });
    }

    // Save response
    const response = await prisma.response.create({
      data: {
        formId: data.formId,
        answers: JSON.stringify(data.answers),
      },
    });

    return json({ success: true, response });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
};
