'use server';

import { connectDB } from "@/lib/dbConfig";
import feedbackSchema from "@/lib/schema/feedback";

export async function submitFeedback(formData) {
  try {
    const rawData = Object.fromEntries(formData.entries());

    // Validate using Zod
    const parsed = feedbackSchema.safeParse(rawData);

    if (!parsed.success) {
      const firstError =
        parsed.error.errors?.[0]?.message || "Invalid form data";

      return { status: 400, msg: firstError };
    }

    const data = parsed.data;

    const feedback = {
      name: data.name || "",
      email: data.email || "",
      category: data.category,
      message: data.message,
      createdAt: new Date(),
    };

    const db = await connectDB();
    await db.collection('feedbacks').insertOne(feedback);

    return { status: 200, msg: 'Feedback submitted successfully' };

  } catch (error) {
    console.error("Feedback error:", error);
    return { status: 500, msg: 'Failed to submit feedback. Try again.' };
  }
}