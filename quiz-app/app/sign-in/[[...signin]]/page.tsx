import LoginPage from "@/app/(auth)/login/page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("__Secure-better-auth.session_token")?.value;

  if (token) {
    return redirect("/dashboard");
  }
  return <LoginPage />;
}

