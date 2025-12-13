import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-3xl mx-auto p-4">
        <div className="relative flex items-end gap-2 bg-card rounded-2xl border border-border shadow-lg p-2 transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova AI..."
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground",
              "focus:outline-none py-2 px-1 max-h-[200px] scrollbar-thin"
            )}
            disabled={isLoading}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl transition-all",
              message.trim()
                ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Nova AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
