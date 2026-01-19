import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. Handle CORS Pre-flight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const body = await request.json();
    const { formId, answers } = body;

    console.log("Incoming Submission:", { formId, answers });

    // 2. Validation
    if (!formId || !answers) {
      console.error("Validation Failed: Missing formId or answers");
      return json({ error: "Missing required fields" }, { status: 400, headers });
    }

    // 3. Check if the Form actually exists (Crucial after a database reset!)
    const formExists = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!formExists) {
      console.error(`Error: Form with ID ${formId} does not exist in the database.`);
      return json({ 
        error: "Form not found", 
        details: "The Form ID provided does not exist. If you reset your database, you must create a new form and update the ID in Shopify." 
      }, { status: 404, headers });
    }

    // 4. Save to the Response model
    const newResponse = await prisma.response.create({
      data: {
        formId: formId,
        answers: JSON.stringify(answers), // Ensure it's stored as a string if schema expects String, or keep as object if Json
      },
    });

    console.log("Success: Saved response", newResponse.id);
    return json({ success: true, id: newResponse.id }, { headers });

  } catch (error) {
    // 5. Detailed Error Logging for Vercel
    console.error("CRITICAL SUBMISSION ERROR:", error);
    
    return json({ 
      error: "Internal Server Error", 
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
    }, { status: 500, headers });
  }
};