import { Bot, Menu, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Company Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Powered by RAG • Always learning
            </p>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </header>
  );
}
