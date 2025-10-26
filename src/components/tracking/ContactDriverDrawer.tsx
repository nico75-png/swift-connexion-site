import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TrackingMessage, TrackingOrder } from "./LiveTrackingSection";

type ContactDriverDrawerProps = {
  trigger?: ReactNode;
  order: TrackingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMessage?: (orderId: string, message: string) => void;
};

const MessageBubble = ({ message, isOwn }: { message: TrackingMessage; isOwn: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18 }}
    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
      isOwn
        ? "ml-auto bg-[#2563EB] text-white"
        : "bg-white/90 text-slate-700 ring-1 ring-slate-200"
    }`}
  >
    <p className={`text-xs ${isOwn ? "text-white/80" : "text-slate-400"}`}>{message.timestamp}</p>
    <p className="mt-1 leading-relaxed text-[13px]">{message.content}</p>
  </motion.div>
);

const QUICK_MESSAGES = [
  "Bonjour, pouvez-vous me confirmer votre heure d'arrivée ?",
  "Merci de me prévenir 5 minutes avant votre arrivée.",
  "Merci de déposer la livraison à l'accueil, s'il vous plaît.",
];

const ContactDriverDrawer = ({ trigger, order, open, onOpenChange, onSendMessage }: ContactDriverDrawerProps) => {
  const [message, setMessage] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const isDisabled = !order;

  const history = useMemo(() => order?.messages ?? [], [order]);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setShowQuickMessages(false);
      return;
    }

    const container = historyRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [open, history.length]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || message.trim().length === 0) return;
    onSendMessage?.(order.id, message);
    setMessage("");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCallDriver = () => {
    if (!order || typeof window === "undefined") return;
    const phone = order.driver.phone.replace(/\s+/g, "");
    window.location.href = `tel:${phone}`;
  };

  const handleQuickMessageSelect = (text: string) => {
    if (!order) return;
    onSendMessage?.(order.id, text);
    setShowQuickMessages(false);
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => onOpenChange(true)} role="presentation">
          {trigger}
        </div>
      ) : null}
      <AnimatePresence>
        {open && order ? (
          <motion.div
            key="contact-driver-overlay"
            className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.button
              type="button"
              aria-label="Fermer la messagerie chauffeur"
              className="pointer-events-auto absolute inset-0 z-0 h-full w-full cursor-pointer bg-gray-50/60 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-auto relative z-10 mx-auto w-full max-w-2xl rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-2xl">
                    {order.driver.avatar ?? "🚚"}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{order.driver.name}</p>
                      <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {order.driver.vehicle} · Plaque {order.driver.licensePlate}
                    </p>
                    <p className="text-xs text-slate-400">{order.code}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-150 ease-out hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              <div
                ref={historyRef}
                className="mt-6 max-h-72 space-y-3 overflow-y-auto pr-1"
              >
                <AnimatePresence initial={false}>
                  {history.length === 0 ? (
                    <motion.p
                      key="empty"
                      className="mt-6 text-center text-sm text-slate-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Aucun échange pour le moment. Envoyez votre premier message.
                    </motion.p>
                  ) : (
                    history.map((item) => (
                      <MessageBubble key={item.id} message={item} isOwn={item.author === "client"} />
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 rounded-lg bg-white text-sm font-semibold text-[#2563EB] shadow-sm transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                    disabled={isDisabled}
                    onClick={handleCallDriver}
                  >
                    📞 Appeler
                  </Button>
                  <div className="relative flex-1">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full rounded-lg bg-white text-sm font-semibold text-[#2563EB] shadow-sm transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                      disabled={isDisabled}
                      onClick={() => setShowQuickMessages((previous) => !previous)}
                    >
                      💬 Envoyer un message rapide
                    </Button>
                    <AnimatePresence>
                      {showQuickMessages && (
                        <motion.ul
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-x-0 top-full z-10 mt-2 space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-lg"
                        >
                          {QUICK_MESSAGES.map((text) => (
                            <li key={text}>
                              <button
                                type="button"
                                className="w-full rounded-lg px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                                onClick={() => handleQuickMessageSelect(text)}
                              >
                                {text}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    disabled={isDisabled}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Écrire un message au chauffeur…"
                    className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                  />
                  <Button
                    type="submit"
                    className="h-12 min-w-[44px] rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                    disabled={isDisabled || message.trim().length === 0}
                  >
                    Envoyer
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default ContactDriverDrawer;
