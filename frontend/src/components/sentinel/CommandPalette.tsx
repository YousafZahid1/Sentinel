import { useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { UserPlus, Bell, CheckCircle, Shield } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign?: () => void;
  onNotify?: () => void;
  onResolve?: () => void;
  onOpenPrivacy?: () => void;
}

const CommandPalette = ({
  open,
  onOpenChange,
  onAssign,
  onNotify,
  onResolve,
  onOpenPrivacy,
}: CommandPaletteProps) => {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Assign / Notify / Resolve / Open Privacy" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={onAssign}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign responder
          </CommandItem>
          <CommandItem onSelect={onNotify}>
            <Bell className="mr-2 h-4 w-4" />
            Notify
          </CommandItem>
          <CommandItem onSelect={onResolve}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Resolve
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={onOpenPrivacy}>
            <Shield className="mr-2 h-4 w-4" />
            Open Privacy
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
