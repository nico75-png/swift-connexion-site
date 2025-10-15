import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
}

interface ChatProps {
  messages: Message[];
  recipientName: string;
  onSendMessage?: (message: string) => void;
  inputDisabled?: boolean;
  disabledMessage?: string;
}

/**
 * Composant de chat pour la messagerie
 */
const Chat = ({ messages, recipientName, onSendMessage, inputDisabled = false, disabledMessage }: ChatProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (inputDisabled) {
      return;
    }

    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">{recipientName}</h3>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label={`Conversation avec ${recipientName}`}
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center" role="status">
            Aucun message pour le moment.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex flex-col gap-3">
        {disabledMessage && (
          <p className="text-xs text-muted-foreground" role="status">
            {disabledMessage}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" disabled={inputDisabled} aria-label="Joindre un fichier">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={inputDisabled}
            aria-label="Saisir un message"
          />
          <Button onClick={handleSend} disabled={inputDisabled} aria-label="Envoyer le message">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Chat;
