import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Chat from "@/components/dashboard/Chat";

const AdminMessages = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Messages" />}>
      <h1 className="text-3xl font-bold mb-6">Messagerie</h1>
      <Chat />
    </DashboardLayout>
  );
};

export default AdminMessages;
