/**
 * @layer component
 * @owner agent-1
 */
"use client";

import * as React from "react";
import { Check, ChevronDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/useWorkspace";
import { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");

  const { activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      const workspace = await createWorkspace.mutateAsync(newWorkspaceName);
      toast.success("Workspace created");
      if (workspace) setActiveWorkspace(workspace);
      setNewWorkspaceName("");
      setShowCreateDialog(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create workspace"
      );
    }
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-full rounded-md" />;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-9 px-2.5 w-full justify-between gap-2 min-w-0",
              "text-neutral-500 dark:text-neutral-400",
              "hover:text-neutral-900 dark:hover:text-neutral-100",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
              "ring-1 ring-transparent hover:ring-neutral-200 dark:hover:ring-neutral-700/60",
              "transition-all duration-150 rounded-md group",
              open && [
                "bg-neutral-100 dark:bg-neutral-800/60",
                "ring-neutral-200 dark:ring-neutral-700/60",
                "text-neutral-900 dark:text-neutral-100",
              ]
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Building2
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors duration-150",
                  open
                    ? "text-[#1B2B4B] dark:text-neutral-200"
                    : "text-neutral-400 group-hover:text-[#1B2B4B] dark:group-hover:text-neutral-200"
                )}
              />
              <span className="truncate text-sm font-normal leading-none text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-150">
                {activeWorkspace?.name ?? "Select workspace"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[200px] p-0 rounded-lg",
            "border border-neutral-200 dark:border-neutral-800",
            "shadow-md shadow-neutral-900/5 dark:shadow-neutral-900/30",
            "bg-white dark:bg-neutral-900"
          )}
          align="start"
          sideOffset={5}
        >
    <Command className="">
  <CommandInput
    placeholder="Search workspaces..."
      className={cn(
        "h-9 text-xs px-3",
        "border-0 border-b border-neutral-100 dark:border-neutral-800",
        "rounded-none bg-transparent",
        "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
        "focus:outline-none focus:ring-0"
      )}
  />
  <CommandList className="max-h-[160px] overflow-y-auto py-1">
    <CommandEmpty className="py-5 text-xs text-center text-neutral-400 dark:text-neutral-600">
      No workspaces found.
    </CommandEmpty>
    <CommandGroup className="px-1">
      {workspaces?.map((workspace: Workspace) => {
        const isActive = activeWorkspace?.id === workspace.id;
        return (
          <CommandItem
            key={workspace.id}
            onSelect={() => {
              setActiveWorkspace(workspace);
              setOpen(false);
            }}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              "rounded-md px-2 py-1.5 text-xs",
              "text-neutral-500 dark:text-neutral-400",
              "aria-selected:bg-neutral-50 dark:aria-selected:bg-neutral-800/60",
              "aria-selected:text-neutral-700 dark:aria-selected:text-neutral-300",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
              "hover:text-neutral-700 dark:hover:text-neutral-300",
              "transition-colors duration-100",
              isActive && "text-neutral-800 dark:text-neutral-200 font-medium"
            )}
          >
            <span className="truncate">{workspace.name}</span>
            {isActive && (
              <Check className="h-3 w-3 shrink-0 text-[#1B2B4B] dark:text-neutral-400 ml-2" />
            )}
          </CommandItem>
        );
      })}
    </CommandGroup>
  </CommandList>

  <CommandSeparator className="bg-neutral-100 dark:bg-neutral-800" />

  <CommandGroup className="px-1 py-1">
    <CommandItem
      onSelect={() => {
        setShowCreateDialog(true);
        setOpen(false);
      }}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1.5 text-xs",
        "text-neutral-400 dark:text-neutral-500",
        "hover:text-neutral-700 dark:hover:text-neutral-300",
        "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
        "aria-selected:bg-neutral-50 dark:aria-selected:bg-neutral-800/60",
        "transition-colors duration-100"
      )}
    >
      <Plus className="mr-1.5 h-3 w-3" />
      New workspace
    </CommandItem>
  </CommandGroup>
</Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className={cn(
            "w-[92%] sm:max-w-[340px] rounded-xl p-5 gap-0",
            "border border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900",
            "shadow-lg shadow-neutral-900/8 dark:shadow-neutral-900/40"
          )}
        >
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-5">
            <DialogHeader className="gap-1">
              <DialogTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                New workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
                Group your quizzes and students under one workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="workspace-name"
                className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Name
              </Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Engineering Team"
                className={cn(
                  "h-9 text-sm rounded-md",
                  "border-neutral-200 dark:border-neutral-700",
                  "bg-neutral-50 dark:bg-neutral-800/50",
                  "text-neutral-900 dark:text-neutral-100",
                  "placeholder:text-neutral-300 dark:placeholder:text-neutral-600",
                  "focus-visible:ring-1 focus-visible:ring-[#1B2B4B]/30 focus-visible:border-[#1B2B4B]/40",
                  "dark:focus-visible:ring-neutral-500 dark:focus-visible:border-neutral-600",
                  "transition-all duration-150"
                )}
                autoFocus
              />
            </div>

            <DialogFooter className="flex flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
                className={cn(
                  "flex-1 h-9 rounded-md text-xs font-normal",
                  "text-neutral-500 dark:text-neutral-400",
                  "hover:text-neutral-900 dark:hover:text-neutral-100",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  "transition-colors duration-150"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWorkspace.isPending || !newWorkspaceName.trim()}
                className={cn(
                  "flex-1 h-9 rounded-md text-xs font-medium",
                  "bg-[#1B2B4B] text-white hover:bg-[#162240]",
                  "dark:bg-[#1B2B4B] dark:text-white dark:hover:bg-[#162240]",
                  "transition-colors duration-150",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {createWorkspace.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}