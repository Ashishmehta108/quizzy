import { z } from "zod";

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),

  query: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  files: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || (files as FileList).length === 0) return true;

        const fileList = files as FileList;

        if (fileList.length > 3) return false;

        const allowedTypes = [
          "application/pdf",
          "text/plain",
          "text/markdown",
          "text/x-markdown",
        ];

        return Array.from(fileList).every(
          (file) =>
            file.size <= 5 * 1024 * 1024 && allowedTypes.includes(file.type)
        );
      },
      {
        message:
          "Files must be PDF, TXT, or Markdown Max 5MB each, up to 3 files allowed.",
      }
    ),
});

export type CreateQuizForm = z.infer<typeof createQuizSchema>;
