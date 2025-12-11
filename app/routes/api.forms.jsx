// app/routes/api.forms.jsx
import { json } from "@remix-run/node";
import prisma from "../db.server"; // <- relative import (make sure app/db.server.js exists)

/*
  Routes:
    GET  /api/forms       -> list forms (dashboard)
    POST /api/forms       -> create a new form (expects { title, questions, shop? })
*/

export const loader = async () => {
  try {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
    });

    // parse questions if stored as strings
    const parsed = forms.map(f => {
      let questions = f.questions;
      try { questions = typeof questions === "string" ? JSON.parse(f.questions) : f.questions; } catch (e) {}
      return { ...f, questions };
    });

    return json(parsed);
  } catch (err) {
    console.error("GET /api/forms error:", err);
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data || !data.title || !data.questions) {
      return json({ error: "Missing title or questions" }, { status: 400 });
    }

    const form = await prisma.form.create({
      data: {
        title: data.title,
        shop: data.shop ?? null,
        questions: typeof data.questions === "string" ? data.questions : JSON.stringify(data.questions),
        status: data.status ?? "Active",
      },
    });

    // return the created form — parse questions for client convenience
    let returned = { ...form };
    try { returned.questions = typeof returned.questions === "string" ? JSON.parse(returned.questions) : returned.questions; } catch(e){}

    return json(returned, { status: 201 });
  } catch (err) {
    console.error("POST /api/forms error:", err);
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
};
