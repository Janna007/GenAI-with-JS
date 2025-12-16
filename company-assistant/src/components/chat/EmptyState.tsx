import { Bot, FileText, HelpCircle, Lightbulb } from "lucide-react";

interface SuggestionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function Suggestion({ icon, title, description, onClick }: SuggestionProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-accent hover:shadow-glow"
    >
      <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Company Policies",
      description: "Ask about HR policies, leave, benefits",
      message: "What is our company's remote work policy?",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: "IT Support",
      description: "Get help with technical issues",
      message: "How do I reset my VPN password?",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Knowledge Base",
      description: "Search internal documentation",
      message: "Find documentation about our API integration process",
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        How can I help you today?
      </h2>
      <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
        I'm your company's AI assistant. Ask me anything about policies,
        procedures, or find information from our knowledge base.
      </p>
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            icon={suggestion.icon}
            title={suggestion.title}
            description={suggestion.description}
            onClick={() => onSuggestionClick(suggestion.message)}
          />
        ))}
      </div>
    </div>
  );
}
