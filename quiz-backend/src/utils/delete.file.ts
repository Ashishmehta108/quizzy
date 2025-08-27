import fs from "fs/promises";
import path from "path";

export const deleteUploadedFile = async (filename: string) => {
  const filePath = path.join(process.cwd(), "uploads", filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
