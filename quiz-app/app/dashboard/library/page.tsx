/**
 * @layer page
 * @owner agent-2
 */
"use client";

import React, { useState } from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function LibraryPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["library", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/library`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/library/${id}`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["library"] });
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredDocs = documents?.filter((d: any) => 
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8">Loading Library...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-zinc-500">Upload and manage your teaching materials.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search documents..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs?.map((doc: any) => (
          <Card key={doc.id} className="group hover:border-zinc-400 dark:hover:border-zinc-500 transition-all">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{doc.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  doc.indexingStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {doc.indexingStatus}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredDocs?.length === 0 && (
          <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <FileText className="h-12 w-12 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-sm text-zinc-500">Upload your PDFs, images, or text files to get started.</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Upload First Document
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
