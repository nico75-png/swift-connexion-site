import Header, { type HeaderNotification } from "./Header";

interface TopbarProps {
  userName?: string;
  title?: string;
  notifications?: HeaderNotification[];
}

const Topbar = ({ userName, title, notifications }: TopbarProps) => {
  return (
    <Header
      title={title ?? "Tableau de bord"}
      subtitle={title ? undefined : "Aperçu de vos indicateurs"}
      userName={userName}
      notifications={notifications}
    />
  );
};

export default Topbar;
