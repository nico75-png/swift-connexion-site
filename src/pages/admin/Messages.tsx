import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Chat from "@/components/dashboard/Chat";

const AdminMessages = () => {
  // Mock messages pour démonstration
  const mockMessages = [
    {
      id: "1",
      sender: "other" as const,
      text: "Bonjour, j'ai une question concernant ma dernière commande.",
      time: "10:30"
    },
    {
      id: "2",
      sender: "me" as const,
      text: "Bonjour, je suis à votre disposition. De quelle commande s'agit-il ?",
      time: "10:32"
    }
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Messages" />}>
      <h1 className="text-3xl font-bold mb-6">Messagerie</h1>
      <Chat messages={mockMessages} recipientName="Support Client" />
    </DashboardLayout>
  );
};

export default AdminMessages;
