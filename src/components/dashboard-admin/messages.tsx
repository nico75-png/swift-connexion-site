import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Paperclip, Send, Sparkles } from "lucide-react";

const conversations = [
  {
    id: "conv-1",
    name: "Support chauffeurs",
    lastMessage: "Brief de tournée validé à 14:00",
    time: "Il y a 8 min",
    unread: 3,
  },
  {
    id: "conv-2",
    name: "Clara Dupont",
    lastMessage: "Merci pour la confirmation de livraison !",
    time: "Il y a 18 min",
    unread: 0,
  },
  {
    id: "conv-3",
    name: "Dispatch Sud",
    lastMessage: "Retard sur l'axe A7 - proposition de reroutage",
    time: "Il y a 32 min",
    unread: 1,
  },
  {
    id: "conv-4",
    name: "Equipe facturation",
    lastMessage: "Facture FAC-2025-125 en relance",
    time: "Il y a 1 h",
    unread: 0,
  },
];

const thread = [
  {
    id: "msg-1",
    author: "Support chauffeurs",
    time: "14:02",
    content: "Bonjour, la tournée express #CMD-54820 démarre avec 10 min d'avance.",
  },
  {
    id: "msg-2",
    author: "Administrateur",
    time: "14:05",
    content: "Parfait, maintenez le briefing avec le chauffeur Marc pour le point de 15h.",
    isMine: true,
  },
  {
    id: "msg-3",
    author: "Support chauffeurs",
    time: "14:07",
    content: "Bien reçu. On surveille également le trafic périphérique pour anticiper les ralentissements.",
  },
];

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string>(conversations[0]?.id ?? "");

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-white/95 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Centre de messagerie</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Coordination en temps réel</h1>
          <p className="mt-2 text-sm text-slate-500">
            Retrouvez les échanges clés avec vos équipes internes et vos clients premium.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Nouveau message
          </Button>
          <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
            <Sparkles className="mr-2 h-4 w-4" /> Réponse assistée
          </Button>
        </div>
      </header>

      <Card className="grid gap-6 rounded-3xl border-none bg-white/95 p-6 shadow-lg lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conversations</p>
            <p className="text-sm text-slate-600">{conversations.length} fils actifs</p>
          </div>
          <ScrollArea className="h-[420px] rounded-3xl border border-slate-200/70 bg-white">
            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeConversation;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversation(conversation.id)}
                    className={`flex w-full flex-col items-start gap-1 px-5 py-4 text-left transition ${
                      isActive ? "bg-[#2563EB]/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{conversation.name}</span>
                      <span className="text-xs text-slate-400">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <Badge className="mt-2 rounded-2xl bg-[#2563EB] px-3 py-1 text-[11px] font-semibold text-white">
                        {conversation.unread} non lus
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Support chauffeurs</p>
              <p className="text-xs text-slate-500">Dernière activité il y a 3 min</p>
            </div>
            <Badge className="rounded-2xl bg-[#10B981]/10 px-3 py-1 text-[#047857]">Canal prioritaire</Badge>
          </div>
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-4">
              {thread.map((message) => (
                <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-3xl px-5 py-3 text-sm shadow-sm ${
                      message.isMine
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {!message.isMine && (
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {message.author}
                      </p>
                    )}
                    <p className="mt-1 whitespace-pre-line">{message.content}</p>
                    <p className={`mt-2 text-right text-[11px] ${message.isMine ? "text-white/70" : "text-slate-500"}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
            <Input
              placeholder="Rédiger un message..."
              className="h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400"
            />
            <Button
              variant="outline"
              className="rounded-2xl border-slate-200 px-3 py-2 text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Messages;
