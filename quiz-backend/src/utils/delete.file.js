import fs from "fs";
import path from "path";

export const deleteUploadedFile = (filename) => {
    const filePath = path.join(process.cwd(), "uploads", filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
        } else {
            console.log(`File ${filename} deleted successfully.`);
        }
    });
};
