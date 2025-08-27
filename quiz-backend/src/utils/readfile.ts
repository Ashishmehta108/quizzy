import fs from "fs/promises";
export async function readFile(file_path: string) {
  let d = null;
  const fileContent = await fs.readFile(file_path);
  console.log(fileContent);
  return fileContent;
}
