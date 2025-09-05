"use client";

import { useState } from "react";
import Link from "next/link";
import { Add } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateQuizForm from "./createQuizForm";

export default function CreateQuizModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm ring-1 ring-zinc-900/10 dark:ring-zinc-100/10 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible  :ring-zinc-100">
          <Add size="18" className="mr-2" />
          Create Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className=" max-w-md rounded-xl sm:max-w-xl p-6">
        <DialogHeader>
          <DialogTitle>Create a New Quiz</DialogTitle>
          <DialogDescription>
            Upload files and describe your quiz details
          </DialogDescription>
        </DialogHeader>
        <CreateQuizForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
