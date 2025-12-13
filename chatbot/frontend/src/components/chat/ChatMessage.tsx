import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-6 md:px-8 lg:px-12",
        isUser ? "bg-transparent" : "bg-card/50"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-accent to-primary text-primary-foreground"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="font-medium text-sm text-muted-foreground">
          {isUser ? "You" : "Nova AI"}
        </p>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
