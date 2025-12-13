import { Sparkles, Code, Lightbulb, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: "Help me debug",
    description: "my React component",
  },
  {
    icon: Lightbulb,
    title: "Explain quantum",
    description: "computing simply",
  },
  {
    icon: PenTool,
    title: "Write a poem",
    description: "about technology",
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg glow-primary">
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
        Hello, I'm <span className="text-primary">Nova AI</span>
      </h1>

      <p className="text-muted-foreground text-lg mb-12 text-center max-w-md">
        Your intelligent assistant. Ask me anything or try one of these suggestions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border hover:border-primary/50 transition-all group"
            onClick={() => onSuggestionClick(`${suggestion.title} ${suggestion.description}`)}
          >
            <suggestion.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-foreground">{suggestion.title}</p>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
