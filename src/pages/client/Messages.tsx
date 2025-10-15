import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Chat from "@/components/dashboard/Chat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

/**
 * Page de messagerie avec support et chauffeurs
 */
const ClientMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("support");

  const conversations = [
    {
      id: "support",
      name: "Support One Connexion",
      type: "support",
      lastMessage: "Nous avons bien reçu votre demande",
      time: "Il y a 1h",
      unread: 1,
    },
    {
      id: "driver-marc",
      name: "Marc Dupuis (Chauffeur)",
      type: "driver",
      order: "HORDE25001",
      lastMessage: "J'arrive dans 10 minutes",
      time: "Il y a 5 min",
      unread: 2,
    },
  ];

  const supportMessages = [
    { id: "1", sender: "me" as const, text: "Bonjour, j'aimerais des informations sur les tarifs", time: "10:30" },
    { id: "2", sender: "other" as const, text: "Bonjour ! Je serais ravi de vous aider. Quel type de transport vous intéresse ?", time: "10:32" },
    { id: "3", sender: "me" as const, text: "Transport médical en urgence", time: "10:33" },
    { id: "4", sender: "other" as const, text: "Pour le médical express, le tarif de base est de 35€ + 0.9€/km", time: "10:35" },
  ];

  const driverMessages = [
    { id: "1", sender: "other" as const, text: "Bonjour, je suis en route pour l'enlèvement", time: "11:20" },
    { id: "2", sender: "me" as const, text: "Parfait, merci !", time: "11:21" },
    { id: "3", sender: "other" as const, text: "J'arrive dans 10 minutes", time: "11:25" },
  ];

  const currentMessages = selectedConversation === "support" ? supportMessages : driverMessages;
  const currentRecipient = conversations.find(c => c.id === selectedConversation);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="h-[calc(100vh-12rem)]">
        <div className="grid md:grid-cols-[350px_1fr] gap-6 h-full">
          {/* Liste des conversations */}
          <Card className="p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </h2>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedConversation === conv.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/30 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{conv.name}</p>
                    {conv.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                  {conv.order && (
                    <p className="text-xs text-primary mb-1">Commande {conv.order}</p>
                  )}
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{conv.time}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Zone de chat */}
          {currentRecipient && (
            <Chat
              messages={currentMessages}
              recipientName={currentRecipient.name}
              onSendMessage={(msg) => console.log("Send:", msg)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;
