import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, MessageSquare, X, Trash2 } from "lucide-react";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <h2 className="font-semibold text-sidebar-foreground">Conversations</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNew}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative flex cursor-pointer flex-col rounded-lg p-3 transition-all",
                    activeId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => {
                    onSelect(conversation.id);
                    onClose();
                  }}
                >
                  <span className="truncate text-sm font-medium">
                    {conversation.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {conversation.lastMessage}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-sidebar-border p-4">
          <Button
            onClick={onNew}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>
      </aside>
    </>
  );
}
