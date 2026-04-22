import { z } from "zod";

const feedbackSchema = z.object({
  name: z
    .string()
    .max(100, "Name is too long")
    .optional()
    .or(z.literal("")),

  email: z
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  category: z.string().min(1, "Category is required"),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long"),
});

export default feedbackSchema;