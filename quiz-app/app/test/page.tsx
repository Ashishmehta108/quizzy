// "use client";

// import api from "@/lib/api";
// import { Quiz } from "@/lib/types";
// import { Marquee } from "@/components/magicui/marquee";

// export default function Test() {

//   return (
//     <Marquee>
//       <span>Next.js</span>
//       <span>React</span>
//       <span>TypeScript</span>
//       <span>Tailwind CSS</span>
//     </Marquee>
//   );
// }

"use client";

import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
export default function Test() {
  const { getToken } = useAuth();
  const sendbackend = async () => {
    const token = await getToken();
    console.log(token);
    const res = await axios.get("http://localhost:5000/user", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    console.log(res.data);
  };

  return (
    <div>
      <Button onClick={sendbackend}>Test</Button>
    </div>
  );
}
