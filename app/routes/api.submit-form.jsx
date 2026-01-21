import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const method = request.method;

  // --- 1. HANDLE DELETE ---
  if (method === "DELETE") {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return json({ error: "Missing form ID" }, { status: 400 });
      }

      // Deletes the form and its data
      await prisma.form.delete({
        where: { id: id },
      });

      return json({ success: true, message: "Form deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      return json({ error: "Failed to delete form" }, { status: 500 });
    }
  }

  // --- 2. HANDLE POST (Your existing submission logic) ---
  if (method === "POST") {
    try {
      let payload;
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        payload = await request.json();
      } else {
        const formData = await request.formData();
        payload = Object.fromEntries(formData.entries());
      }

      const { formId, shop, ...rest } = payload;
      const answers = contentType?.includes("application/json") ? payload.answers : rest;

      if (!formId || !shop) {
        return json({ error: "Missing formId or shop domain" }, { status: 400 });
      }

      // Verification
      const form = await prisma.form.findFirst({
        where: { id: formId, shop: shop },
      });

      if (!form) {
        return json({ error: "Form verification failed." }, { status: 404 });
      }

      // Create Response
      const response = await prisma.response.create({
        data: {
          formId: formId,
          answers: answers,
        },
      });

      return json({ 
        success: true, 
        message: "Form submitted successfully",
        responseId: response.id 
      });

    } catch (error) {
      console.error("Form submission error:", error);
      return json({ error: "Failed to submit form" }, { status: 500 });
    }
  }

  // Fallback for other methods
  return json({ error: "Method not allowed" }, { status: 405 });
};