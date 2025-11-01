import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const connectionHistory = [
  { id: 1, device: "Chrome sur Windows", date: "25 oct. 2025", ip: "92.167.14.33" },
  { id: 2, device: "Safari sur iPhone", date: "22 oct. 2025", ip: "82.145.54.12" },
  { id: 3, device: "Firefox sur macOS", date: "19 oct. 2025", ip: "91.202.11.03" },
];

type AutosaveStatus = "saved" | "saving";

type ProfileFormState = {
  avatar: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  siret: string;
};

type PreferencesState = {
  emailNotif: boolean;
  dashboardNotif: boolean;
  smsNotif: boolean;
  billingAlerts: boolean;
  orderTracking: boolean;
};

const initialProfile: ProfileFormState = {
  avatar: "https://i.pravatar.cc/300?img=47",
  fullName: "Clara Dupont",
  company: "One connexion",
  email: "clara.dupont@one-connexion.com",
  phone: "+33 6 12 34 56 78",
  siret: "123 456 789 00021",
};

const initialPreferences: PreferencesState = {
  emailNotif: true,
  dashboardNotif: true,
  smsNotif: false,
  billingAlerts: true,
  orderTracking: true,
};

const Parametres = () => {
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfile);
  const [preferences, setPreferences] = useState<PreferencesState>(initialPreferences);
  const [profileStatus, setProfileStatus] = useState<AutosaveStatus>("saved");
  const [preferencesStatus, setPreferencesStatus] = useState<AutosaveStatus>("saved");
  const [profileButtonPulse, setProfileButtonPulse] = useState(false);
  const [preferencesButtonPulse, setPreferencesButtonPulse] = useState(false);

  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferencesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarObjectUrl = useRef<string | null>(null);
  const profilePulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferencesPulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autosaveBadge = useCallback(
    (status: AutosaveStatus) => (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition",
          status === "saved"
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : "border-amber-200 bg-amber-50 text-amber-600",
          isDarkMode &&
            (status === "saved"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"),
        )}
      >
        <span className="text-base">{status === "saved" ? "✓" : "…"}</span>
        {status === "saved" ? "Enregistré" : "Sauvegarde…"}
      </span>
    ),
    [isDarkMode],
  );

  const queueProfileAutosave = useCallback(() => {
    if (profileTimer.current) {
      clearTimeout(profileTimer.current);
    }
    setProfileStatus("saving");
    profileTimer.current = setTimeout(() => {
      setProfileStatus("saved");
    }, 1000);
  }, []);

  const queuePreferencesAutosave = useCallback(() => {
    if (preferencesTimer.current) {
      clearTimeout(preferencesTimer.current);
    }
    setPreferencesStatus("saving");
    preferencesTimer.current = setTimeout(() => {
      setPreferencesStatus("saved");
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (profileTimer.current) {
        clearTimeout(profileTimer.current);
      }
      if (preferencesTimer.current) {
        clearTimeout(preferencesTimer.current);
      }
      if (avatarObjectUrl.current) {
        URL.revokeObjectURL(avatarObjectUrl.current);
      }
      if (profilePulseTimer.current) {
        clearTimeout(profilePulseTimer.current);
        profilePulseTimer.current = null;
      }
      if (preferencesPulseTimer.current) {
        clearTimeout(preferencesPulseTimer.current);
        preferencesPulseTimer.current = null;
      }
    };
  }, []);

  const handleProfileChange = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setProfileForm((prev) => ({ ...prev, [key]: value }));
      queueProfileAutosave();
    },
    [queueProfileAutosave],
  );

  const handlePreferenceChange = useCallback(
    <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      queuePreferencesAutosave();
    },
    [queuePreferencesAutosave],
  );

  const handleAvatarUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (avatarObjectUrl.current) {
        URL.revokeObjectURL(avatarObjectUrl.current);
      }

      const objectUrl = URL.createObjectURL(file);
      avatarObjectUrl.current = objectUrl;
      handleProfileChange("avatar", objectUrl);
    },
    [handleProfileChange],
  );

  const handleProfileSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setProfileButtonPulse(true);
      if (profilePulseTimer.current) {
        clearTimeout(profilePulseTimer.current);
      }
      profilePulseTimer.current = setTimeout(() => {
        setProfileButtonPulse(false);
        profilePulseTimer.current = null;
      }, 600);
      toast({
        title: "Modifications enregistrées avec succès ✅",
        description: "Votre profil a bien été mis à jour.",
      });
    },
    [toast],
  );

  const handlePreferencesSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPreferencesButtonPulse(true);
      if (preferencesPulseTimer.current) {
        clearTimeout(preferencesPulseTimer.current);
      }
      preferencesPulseTimer.current = setTimeout(() => {
        setPreferencesButtonPulse(false);
        preferencesPulseTimer.current = null;
      }, 600);
      toast({
        title: "Modifications enregistrées avec succès ✅",
        description: "Vos préférences de communication ont été sauvegardées.",
      });
    },
    [toast],
  );

  const handlePasswordUpdate = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const currentPassword = String(formData.get("currentPassword") ?? "");
      const newPassword = String(formData.get("newPassword") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Champs manquants",
          description: "Merci de remplir tous les champs du formulaire.",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Erreur de confirmation",
          description: "Les deux mots de passe ne correspondent pas.",
        });
        return;
      }

      toast({
        title: "Modifications enregistrées avec succès ✅",
        description: "Votre mot de passe a été mis à jour.",
      });
      event.currentTarget.reset();
    },
    [toast],
  );

  const handleDisconnectAll = useCallback(() => {
    toast({
      title: "Modifications enregistrées avec succès ✅",
      description: "Tous les appareils ont été déconnectés.",
    });
  }, [toast]);

  const containerClasses = useMemo(
    () =>
      cn(
        "mx-auto flex h-[calc(100vh-160px)] max-w-[1200px] flex-col gap-6 rounded-3xl p-6 transition-colors duration-500",
        isDarkMode ? "bg-neutral-900 text-neutral-200" : "bg-gray-50 text-gray-900",
      ),
    [isDarkMode],
  );

  const cardClasses = useCallback(
    (extra?: string) =>
      cn(
        "flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300",
        isDarkMode
          ? "border-neutral-800/60 bg-neutral-800/60 hover:border-neutral-700 hover:bg-neutral-800"
          : "border-gray-100 bg-white hover:shadow-md",
        extra,
      ),
    [isDarkMode],
  );

  return (
    <section className="space-y-6 text-[14px]">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={cn("text-[26px] font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>Paramètres du compte</h1>
            <p className={cn("text-sm", isDarkMode ? "text-neutral-400" : "text-gray-600")}>
              Consultez et modifiez vos informations personnelles, vos préférences et la sécurité de votre compte.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isDarkMode
                ? "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-100",
            )}
          >
            <span className="text-lg" aria-hidden>
              {isDarkMode ? "🌙" : "☀️"}
            </span>
            {isDarkMode ? "Mode sombre" : "Mode clair"}
          </button>
        </div>
      </header>

      <div className={containerClasses}>
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profil & Identité */}
          <form onSubmit={handleProfileSubmit} className={cardClasses("col-span-1 space-y-5")}> 
            <div className="flex items-start justify-between">
              <div>
                <h2 className={cn("text-[17px] font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>
                  Informations du compte
                </h2>
                <p className={cn("text-sm", isDarkMode ? "text-neutral-400" : "text-gray-600")}>
                  Mettez à jour vos informations personnelles et votre image de profil.
                </p>
              </div>
              {autosaveBadge(profileStatus)}
            </div>

            <div
              className={cn(
                "flex flex-col gap-4 rounded-2xl border border-dashed p-4",
                isDarkMode ? "border-neutral-700 bg-neutral-900/60" : "border-gray-200 bg-gray-50/60",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <img
                    src={profileForm.avatar}
                    alt="Avatar du profil"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-800")}>Photo de profil</p>
                  <p className={cn("text-xs", isDarkMode ? "text-neutral-400" : "text-gray-500")}>
                    Formats acceptés : JPG, PNG. Taille recommandée 400x400 px.
                  </p>
                  <label
                    htmlFor="avatar"
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition",
                      isDarkMode
                        ? "bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    )}
                  >
                    <span className="text-base" aria-hidden>
                      ⬆️
                    </span>
                    Mettre à jour la photo
                    <input id="avatar" name="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}>
                  Nom complet
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profileForm.fullName}
                  disabled
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-inner",
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-800 text-neutral-400"
                      : "border-gray-200 bg-gray-100 text-gray-600",
                  )}
                />
                <p className={cn("text-xs", isDarkMode ? "text-neutral-500" : "text-gray-500")}>
                  Validé par l'équipe One connexion.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}>
                  Société
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={profileForm.company}
                  readOnly
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-inner",
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-800 text-neutral-300"
                      : "border-gray-200 bg-gray-100 text-gray-700",
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}>
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-800 text-neutral-100 focus:ring-blue-500/30"
                      : "border-gray-200 bg-white text-gray-800",
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}>
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) => handleProfileChange("phone", event.target.value)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-800 text-neutral-100 focus:ring-blue-500/30"
                      : "border-gray-200 bg-white text-gray-800",
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="siret" className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}>
                  Numéro de SIRET
                </label>
                <input
                  id="siret"
                  name="siret"
                  type="text"
                  value={profileForm.siret}
                  readOnly
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-sm shadow-inner",
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-800 text-neutral-300"
                      : "border-gray-200 bg-gray-100 text-gray-700",
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={cn(
                  "mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "hover:bg-blue-700",
                  profileButtonPulse && "animate-pulse",
                  isDarkMode && "bg-blue-500 hover:bg-blue-600 focus-visible:ring-offset-neutral-900",
                )}
              >
                Mettre à jour le profil
              </button>
            </div>
          </form>

          {/* Préférences */}
          <form onSubmit={handlePreferencesSubmit} className={cardClasses("col-span-1 space-y-5")}> 
            <div className="flex items-start justify-between">
              <div>
                <h2 className={cn("text-[17px] font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>
                  Préférences de communication
                </h2>
                <p className={cn("text-sm", isDarkMode ? "text-neutral-400" : "text-gray-600")}>
                  Choisissez comment recevoir vos notifications et mises à jour.
                </p>
              </div>
              {autosaveBadge(preferencesStatus)}
            </div>

            <div className="space-y-3">
              {[{
                key: "emailNotif" as const,
                label: "Notifications par e-mail",
                description: "Recevez les alertes importantes directement dans votre boîte mail.",
              }, {
                key: "dashboardNotif" as const,
                label: "Notifications dans le tableau de bord",
                description: "Affiche les alertes dans le centre de notifications.",
              }, {
                key: "smsNotif" as const,
                label: "Notifications par SMS",
                description: "Soyez informé instantanément sur votre téléphone.",
              }, {
                key: "billingAlerts" as const,
                label: "Alertes de facturation",
                description: "Rappel des échéances et disponibilités de factures.",
              }, {
                key: "orderTracking" as const,
                label: "Suivi de commande",
                description: "Mises à jour en temps réel de vos livraisons.",
              }].map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-xl border border-transparent px-4 py-3 transition",
                    isDarkMode
                      ? "hover:border-blue-500/30 hover:bg-blue-500/10"
                      : "hover:border-blue-200/70 hover:bg-blue-50/40",
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-medium", isDarkMode ? "text-neutral-100" : "text-gray-800")}>{item.label}</p>
                    <p className={cn("text-xs", isDarkMode ? "text-neutral-400" : "text-gray-500")}>{item.description}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key]}
                    onCheckedChange={(value) => handlePreferenceChange(item.key, value)}
                    className={cn(
                      "data-[state=checked]:bg-blue-600",
                      isDarkMode && "data-[state=checked]:bg-blue-500",
                    )}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className={cn(
                "mt-2 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "hover:bg-blue-700",
                preferencesButtonPulse && "animate-pulse",
                isDarkMode && "bg-blue-500 hover:bg-blue-600 focus-visible:ring-offset-neutral-900",
              )}
            >
              Enregistrer mes préférences
            </button>
          </form>

          {/* Sécurité & connexion */}
          <div className={cardClasses("col-span-1 space-y-6")}> 
            <div className="space-y-5">
              <div>
                <h2 className={cn("text-[17px] font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>
                  Sécurité du compte
                </h2>
                <p className={cn("text-sm", isDarkMode ? "text-neutral-400" : "text-gray-600")}>
                  Renforcez la sécurité de votre compte et surveillez vos connexions.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>
                  Changer le mot de passe
                </h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="currentPassword"
                      className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}
                    >
                      Mot de passe actuel
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
                        isDarkMode
                          ? "border-neutral-700 bg-neutral-800 text-neutral-100 focus:ring-blue-500/30"
                          : "border-gray-200 bg-white text-gray-800",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}
                    >
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
                        isDarkMode
                          ? "border-neutral-700 bg-neutral-800 text-neutral-100 focus:ring-blue-500/30"
                          : "border-gray-200 bg-white text-gray-800",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className={cn("text-sm font-medium", isDarkMode ? "text-neutral-200" : "text-gray-700")}
                    >
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100",
                        isDarkMode
                          ? "border-neutral-700 bg-neutral-800 text-neutral-100 focus:ring-blue-500/30"
                          : "border-gray-200 bg-white text-gray-800",
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      "w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isDarkMode && "bg-blue-500 hover:bg-blue-600 focus-visible:ring-offset-neutral-900",
                    )}
                  >
                    Mettre à jour
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-neutral-100" : "text-gray-900")}>
                  Connexion & activité
                </h3>
                <p className={cn("text-xs", isDarkMode ? "text-neutral-400" : "text-gray-500")}>
                  Historique des 3 dernières connexions réussies.
                </p>
              </div>
              <div className="space-y-3">
                {connectionHistory.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "flex items-start justify-between rounded-xl border border-transparent px-4 py-3 text-sm transition",
                      isDarkMode
                        ? "bg-neutral-900/60 text-neutral-200 hover:border-blue-500/30 hover:bg-blue-500/10"
                        : "bg-gray-50/70 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50",
                    )}
                  >
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className={cn("text-xs", isDarkMode ? "text-neutral-400" : "text-gray-500")}>{session.date}</p>
                    </div>
                    <span className={cn("text-xs font-mono", isDarkMode ? "text-neutral-400" : "text-gray-500")}>{session.ip}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleDisconnectAll}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Déconnecter tous les appareils
              </button>
            </div>
          </div>
        </div>

        <footer
          className={cn(
            "mt-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3 text-xs transition",
            isDarkMode
              ? "border-neutral-800 bg-neutral-800/80 text-neutral-400"
              : "border-gray-200 bg-white/60 text-gray-500",
          )}
        >
          <span>
            Version de l'application :
            <strong className={cn("ml-1 font-semibold", isDarkMode ? "text-neutral-200" : "text-gray-700")}>v2.5.3</strong>
          </span>
          <a
            href="/mentions-legales"
            className={cn(
              "text-xs font-medium transition hover:underline",
              isDarkMode ? "text-blue-300" : "text-blue-600",
            )}
          >
            Mentions légales / Politique de confidentialité
          </a>
          <span>
            Support technique :
            <a
              href="mailto:support@one-connexion.com"
              className={cn(
                "ml-1 font-medium transition hover:underline",
                isDarkMode ? "text-blue-300" : "text-blue-600",
              )}
            >
              support@one-connexion.com
            </a>
          </span>
        </footer>
      </div>
    </section>
  );
};

export default Parametres;
