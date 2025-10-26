const Messages = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Messages</h1>
        <p className="mt-2 text-sm text-slate-600">
          Centralisez vos échanges clients, assignez des conversations et gardez un œil sur les demandes importantes. Un
          module de messagerie pourra être intégré ici.
        </p>
      </header>

      <div className="rounded-xl border border-[#E0E9F5] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Aucun message à afficher. Connectez votre service de support ou une intégration CRM pour alimenter cette
          section.
        </p>
      </div>
    </section>
  );
};

export default Messages;
