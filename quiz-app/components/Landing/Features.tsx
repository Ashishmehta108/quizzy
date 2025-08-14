// import { AnimatedElement } from "@/app/page";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   LucideIcon,
//   Sparkles,
//   FileText,
//   BarChart3,
//   MessageSquare,
//   Upload,
//   Wand2,
//   Pencil,
// } from "lucide-react";

// type Feature = {
//   title: string;
//   description: string;
//   icons: [LucideIcon];
//   color: string; // tailwind color class
// };

// export function Features() {
//   const features: Feature[] = [
//     {
//       title: "AI-Powered Generation",
//       description:
//         "Create comprehensive quizzes on any topic with our advanced AI. Just tell us what you want to learn and watch the magic happen.",
//       icons: [Sparkles],
//       color: "text-pink-500",
//     },
//     {
//       title: "Document Intelligence",
//       description:
//         "Upload PDFs, text files, or documents and automatically generate contextual quizzes from your content with perfect accuracy.",
//       icons: [FileText],
//       color: "text-blue-500",
//     },
//     {
//       title: "Progress Tracking",
//       description:
//         "Monitor your learning journey with real-time progress tracking and insights to keep you motivated and on track.",
//       icons: [BarChart3],
//       color: "text-green-500",
//     },
//     {
//       title: "Interactive Learning",
//       description:
//         "Take quizzes with an engaging interface, get instant feedback, and ask follow-up questions to deepen understanding.",
//       icons: [Pencil],
//       color: "text-yellow-500",
//     },
//   ];

//   return (
//     <section className="py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
//       <div className="max-w-5xl container mx-auto flex flex-col items-center">
//         <AnimatedElement>
//           <div className="text-center mb-24 text-5xl sm:text-6xl font-semibold text-zinc-900 dark:text-white">
//             Features
//           </div>
//         </AnimatedElement>

//         <div className="grid md:grid-cols-2 gap-10 w-full">
//           {features.map((feature, index) => {
//             const Icon1 = feature.icons[0];
//             // const Icon2 = feature.icons[1];

//             return (
//               <AnimatedElement key={index} >
//                 <Card
//                   className="h-full p-8 
//                     bg-white/30 dark:bg-zinc-900/70 
//                     backdrop-blur-lg 
//                     cursor-pointer
//                     border border-zinc-300/60 dark:border-zinc-800 
//                     shadow-[0_4px_20px_rgba(0,0,0,0.05)] 
//                     rounded-2xl transition-all duration-300 
//                     hover:shadow-lg"
//                 >
//                   <CardContent className="p-0">
//                     <div className="flex flex-col items-center md:flex-row md:items-start space-x-6">

//                       <div
//                         className={`relative w-14 h-14 rounded-full 
//                         bg-white/60 backdrop-blur-md 
//                         border border-zinc-100/50 
//                         dark:border-zinc-800
//                         dark:bg-zinc-800/60
//                         flex items-center justify-center 
//                         `}
//                       >
//                         {/* First Icon (solid) */}
//                         <Icon1
//                           className={` absolute h-6 w-6 ${feature.color} opacity-90`}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
//                           {feature.title}
//                         </h3>
//                         <p className="text-zinc-600 text-sm dark:text-gray-300 leading-relaxed">
//                           {feature.description}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </AnimatedElement>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }
