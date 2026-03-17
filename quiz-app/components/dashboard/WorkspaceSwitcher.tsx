/**
 * @layer component
 * @owner agent-1
 */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Building2 } from "lucide-react";
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
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between transition-all duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <span className="truncate">
              {activeWorkspace?.name || "Select workspace..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 shadow-lg border-zinc-200 dark:border-zinc-800">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces?.map((workspace: any) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => {
                    setActiveWorkspace(workspace);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {workspace.name}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      activeWorkspace?.id === workspace.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  // This is a placeholder for a "Create Workspace" dialog
                  toast.info("Coming soon: Create Workspace dialog");
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
