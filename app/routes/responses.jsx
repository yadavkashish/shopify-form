import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async () => {
  try {
    const responses = await prisma.response.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        form: {
          select: {
            title: true,
          },
        },
      },
    });

    // Shape data for frontend
    const formatted = responses.map(r => ({
      id: r.id,
      formId: r.formId,
      formTitle: r.form.title,
      answers: r.answers,
      email: r.answers?.Email || r.answers?.email || null, // optional
      createdAt: r.createdAt,
    }));

    return json(formatted);
  } catch (error) {
    console.error("Responses API Error:", error);
    return json({ error: "Failed to fetch responses" }, { status: 500 });
  }
};
