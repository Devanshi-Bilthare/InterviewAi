import { z } from "zod";

export const executeCodeSchema = z.object({
  code: z.string().min(1),
  language: z.enum(["javascript", "python", "java", "cpp"]),
  stdin: z.string().optional(),
  problemId: z.string().optional(),
});

export const submitCodeSchema = z.object({
  code: z.string().min(1),
  language: z.enum(["javascript", "python", "java", "cpp"]),
  problemId: z.string().min(1),
});
