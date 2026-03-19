/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  BarChart3, 
  PlayCircle,
  Settings,
  MoreVertical,
  ChevronRight,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceContext();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${id}`, {
        headers: { "x-workspace-id": activeWorkspace?.id }
      });
      return data.data;
    },
    enabled: !!id && !!activeWorkspace?.id,
  });

  if (isLoading) return (
    <div className="p-10 flex items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 border-4 border-zinc-200 border-t-zinc-600 rounded-full"
      />
    </div>
  );

  if (!course) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] ring-1 ring-zinc-100 dark:ring-zinc-800">
        <Sparkles className="h-14 w-14 text-zinc-300" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Module Not Found</h2>
        <p className="text-zinc-500 max-w-xs mx-auto">The requested course architecture could not be located in this workspace.</p>
      </div>
      <Button 
        className="rounded-2xl h-14 px-8 font-black bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 hover:shadow-zinc-900/20 active:scale-95 transition-all"
        onClick={() => router.push("/dashboard/courses")}
      >
        Return to Repository
      </Button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-50/10 dark:bg-black/5"
    >
      {/* Hero Header */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-3xl border-b border-zinc-200/60 dark:border-zinc-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-zinc-100/50 dark:from-zinc-800/10 to-transparent" />
        
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              className="mb-10 -ml-4 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold group"
              onClick={() => router.push("/dashboard/courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Repository
            </Button>
          </motion.div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-4">
                <Badge className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full px-5 py-1 text-[10px] tracking-[0.2em] font-black uppercase border-none shadow-lg shadow-zinc-900/10 dark:shadow-white/5">ARCHITECTURE</Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  ID-MOD: {id.toString().slice(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.05]">
                {course.title}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-3xl">
                {course.description || "A comprehensive learning module designed to synthesize complex information into actionable intelligence."}
              </p>
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
               <Button variant="outline" size="icon" className="h-16 w-16 rounded-[24px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm">
                  <Settings className="h-6 w-6 text-zinc-500" />
               </Button>
               <Button className="h-16 px-10 flex-1 lg:flex-none rounded-[24px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-lg font-black shadow-2xl shadow-zinc-900/20 dark:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
                  Update Structure
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12">
        <Tabs defaultValue="content" className="space-y-12">
          <TabsList className="bg-transparent h-auto p-0 gap-10 rounded-none w-full justify-start overflow-x-auto custom-scrollbar border-none">
            {["Content", "Cohorts", "Analytics", "Settings"].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab.toLowerCase()} 
                className="px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none font-black text-xl uppercase tracking-tighter text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-all duration-300"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="content" className="mt-0 ring-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3 space-y-8">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                     <div className="p-2 bg-zinc-900 dark:bg-white rounded-xl">
                        <BookOpen className="h-5 w-5 text-white dark:text-zinc-900" />
                     </div>
                     Learning Modules
                   </h3>
                   <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                     Connect Resource
                   </Button>
                </div>
                
                {/* Visual Empty State */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="relative group cursor-pointer"
                >
                  <Card className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 py-32 flex flex-col items-center justify-center text-center space-y-6 rounded-[48px] bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm transition-all duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-50/50 dark:to-zinc-900/20" />
                    <div className="relative z-10 space-y-6">
                      <div className="p-8 bg-white dark:bg-zinc-800 rounded-[32px] shadow-2xl shadow-zinc-500/5 ring-1 ring-zinc-100 dark:ring-zinc-800 transform group-hover:rotate-6 transition-transform duration-500">
                        <Layers className="h-14 w-14 text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <div className="max-w-sm px-6">
                        <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Repository Empty</h4>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">No pedagogical modules are currently synced to this track. Link quizzes from your library.</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-10">
                 <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <div className="p-2 bg-amber-500/10 rounded-xl">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                   </div>
                   Vital Metrics
                 </h3>
                 <div className="grid gap-6">
                    {[
                      { label: "Completion Ratio", value: "0%", sub: "Global Average", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-500/5" },
                      { label: "Student Volume", value: "0", sub: "Active Enrollment", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                      { label: "Intelligence Index", value: "N/A", sub: "Mean Assessment", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/5" }
                    ].map((stat, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                      >
                        <Card className="rounded-[32px] border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden group hover:scale-[1.03] transition-all duration-300">
                          <CardContent className="p-8 flex items-center gap-6">
                            <div className={`p-4 ${stat.bg} rounded-[24px] transform group-hover:rotate-12 transition-transform duration-500`}>
                              <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{stat.label}</p>
                              <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{stat.value}</p>
                              <p className="text-[10px] font-bold text-zinc-400 italic mt-1">{stat.sub}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
