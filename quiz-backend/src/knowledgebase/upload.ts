import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string
) {
  console.log(file)
  const { data, error } = await supabase.storage
    .from("quizzy")
    .upload(`knowledgebase/${fileName}`, file, {
      contentType: mimeType,
      upsert: true,
    });
  if (error) {
    console.error("supabase error", error.message);
  } else {
    console.log("✅ file uploaded to supabase");
  }
}
