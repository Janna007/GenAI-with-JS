import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-card transition-all focus-within:border-primary/50 focus-within:shadow-glow">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "max-h-[150px] min-h-[44px] flex-1 resize-none border-0 bg-transparent p-2 text-sm",
          "placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        rows={1}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        className={cn(
          "h-9 w-9 shrink-0 rounded-xl transition-all",
          message.trim()
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
