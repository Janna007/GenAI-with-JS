import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatWithServer } from "@/http/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
 
  const [threadId,setThreadId]=useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const [chats, setChats] = useState<Chat[]>([]);


  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const { mutateAsync: chatWithLlm, isPending: isChatPending } = chatWithServer();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);


  useEffect(() => {
    let storedThreadId = localStorage.getItem("threadId");
    if ( !storedThreadId ||
      storedThreadId === "null" ||
      storedThreadId === "undefined") {
      storedThreadId = Date.now().toString(36);
      localStorage.setItem("threadId", storedThreadId);
    }
  
    setThreadId(storedThreadId);
  }, []);

  useEffect(() => {
    if (threadId) {
      console.log("ThreadId:", threadId);
    }
  }, [threadId]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      timestamp: new Date(),
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (id: string) => {
    setChats(chats.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };



  const  handleSendMessage = async(content: string) => {
    let chatId = activeChatId;

    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        timestamp: new Date(),
        messages: [],
      };
      
      setChats([newChat, ...chats]);
      chatId = newChat.id;
      setActiveChatId(chatId);
    }

    const userMessage: Message = {
      role:"user",
      content,
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : chat.title,
            }
          : chat
      )
    );

   

    // Simulate AI response

      const res=await chatWithLlm({message:content,threadId:threadId})

      console.log("response",res)

      // if(isChatPending){
      //   setIsLoading(true)
      // }

      const aimsg:string=res.data.message
      
      const aiMessage: Message = {
        role:"assistant",
        content:aimsg
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );

      // setIsLoading(false);
   
  }; 

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chatHistory={chats.map((c) => ({
          id: c.id,
          title: c.title,
          timestamp: c.timestamp,
        }))}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <div className="w-10" />}
            <h1 className="font-semibold text-foreground">
              {activeChat?.title || "Nova AI"}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeChat && activeChat.messages.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              {activeChat.messages.map((message) => (
                <ChatMessage
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isChatPending && (
                <ChatMessage role="assistant" content="" isLoading />
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <WelcomeScreen onSuggestionClick={handleSendMessage} />
          )}
        </div>

        {/* Input area */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Index;
