import { useRef, useEffect, useState, useCallback } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { ConversationSidebar, Conversation } from "./ConversationSidebar";
import { chatWithServer } from "@/http/api";

// Simulated response for demo purposes
const simulateResponse = (userMessage: string): string => {
  const responses: Record<string, string> = {
    "What is our company's remote work policy?":
      "Our company supports a hybrid work model. Employees can work remotely up to 3 days per week, with mandatory in-office days on Tuesdays and Thursdays for team collaboration. Remote work arrangements must be approved by your direct manager. For extended remote work (more than 2 weeks), please submit a request through the HR portal.",
    "How do I reset my VPN password?":
      "To reset your VPN password:\n\n1. Visit the IT Self-Service Portal at it.company.com\n2. Click 'Reset VPN Credentials'\n3. Verify your identity using your employee ID and registered email\n4. Create a new password (must be 12+ characters with special characters)\n5. Wait 15 minutes for the change to propagate\n\nIf you continue to have issues, contact IT Support at ext. 4357.",
    "Find documentation about our API integration process":
      "I found several relevant documents about our API integration process:\n\n📄 **API Integration Guide v3.2** - Complete guide for external integrations\n📄 **Authentication Standards** - OAuth 2.0 implementation details\n📄 **Rate Limiting Policy** - API usage limits and best practices\n📄 **Webhook Configuration** - Setting up real-time notifications\n\nWould you like me to summarize any of these documents or provide more specific information?",
  };

  return (
    responses[userMessage] ||
    "I've searched our knowledge base and found some relevant information. Based on company documentation, I can help you with policies, procedures, and technical questions. Could you provide more specific details about what you're looking for?"
  );
};

export function ChatContainer() {
  const [conversations, setConversations] = useState<Conversation[]>([
    // {
    //   id: "1",
    //   title: "Remote Work Policy",
    //   lastMessage: "What is our company's remote work policy?",
    //   updatedAt: new Date(),
    // },
  ]);
  const [activeConversationId, setActiveConversationId] =useState(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: chatWithLlm, isPending: isChatPending } = chatWithServer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  

  const handleSend = useCallback(
    async (content: string) => {

      // console.log("convID",convID)
       let convID=activeConversationId

      if (!convID) {
        const newId = Date.now().toString();
        setConversations((prev) => [
          {
            id: newId,
            title: "New Conversation",
            lastMessage: "Start chatting...",
            updatedAt: new Date(),
          },
          ...prev,
        ]);
        setMessages((prev) => ({ ...prev, [newId]: [] }));
        convID=newId
        setActiveConversationId(newId);
      };

      console.log("set id")

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [convID]: [
          ...(prev[convID] || []),
          userMessage,
        ],
      }));

      // console.log("msg setted")

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convID
            ? {
                ...conv,
                lastMessage: content.slice(0, 50),
                updatedAt: new Date(),
              }
            : conv
        )
      );

      // Simulate typing and response
      setIsTyping(true);
      //call API

      
      const res=await chatWithLlm({question:content})

      console.log("response",res)
  
      // if(isChatPending){
      //   setIsLoading(true)
      // }
  
      const aimsg:string=res.data.answer

      console.log("aimsg",aimsg)
      
   
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aimsg,
          timestamp: new Date(),
        };
        setMessages((prev) => ({
          ...prev,
          [convID]: [
            ...(prev[convID] || []),
            assistantMessage,
          ],
        }));
        setIsTyping(false);
  
      
    },
    [activeConversationId]
  );

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    setConversations((prev) => [
      {
        id: newId,
        title: "New Conversation",
        lastMessage: "Start chatting...",
        updatedAt: new Date(),
      },
      ...prev,
    ]);
    setMessages((prev) => ({ ...prev, [newId]: [] }));
    setActiveConversationId(newId);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
    if (activeConversationId === id) {
      setActiveConversationId(conversations[0]?.id || null);
    }
  };

  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {currentMessages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSend} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {currentMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/30 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSend={handleSend}
              disabled={isTyping}
              placeholder="Ask about company policies, IT support, or search the knowledge base..."
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AI responses are generated from your company's knowledge base
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
