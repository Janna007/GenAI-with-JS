import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-assistant-bubble text-assistant-bubble-foreground border border-border">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-assistant-bubble px-4 py-3">
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
