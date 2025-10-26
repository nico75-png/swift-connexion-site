import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
      isOwn ? "ml-auto bg-[#2563EB] text-white" : "bg-slate-100 text-slate-700"
    } shadow-sm`}
  >
    <p className="text-xs text-slate-400">{message.timestamp}</p>
    <p className="mt-1 leading-relaxed text-[13px]">{message.content}</p>
  </motion.div>
);

const ContactDriverDrawer = ({ trigger, order, open, onOpenChange, onSendMessage }: ContactDriverDrawerProps) => {
  const [message, setMessage] = useState("");
  const isDisabled = !order;

  const history = useMemo(() => order?.messages ?? [], [order]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || message.trim().length === 0) return;
    onSendMessage?.(order.id, message);
    setMessage("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className="max-h-[80vh] rounded-t-3xl bg-white text-left">
        <DrawerHeader className="items-start gap-1 text-left">
          <DrawerTitle className="flex w-full items-center justify-between text-base text-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-lg">
                {order?.driver.avatar ?? "🚚"}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{order?.driver.name ?? "Chauffeur"}</p>
                <p className="text-xs text-slate-500">{order?.driver.vehicle}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              {order?.status ?? "En transit"}
            </span>
          </DrawerTitle>
          <p className="text-xs text-slate-500">Plaque {order?.driver.licensePlate ?? "–"}</p>
        </DrawerHeader>
        <div className="flex h-[320px] flex-col gap-3 overflow-y-auto px-4 pb-4">
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
              history.map((item) => <MessageBubble key={item.id} message={item} isOwn={item.author === "client"} />)
            )}
          </AnimatePresence>
        </div>
        <DrawerFooter className="gap-3 border-t border-slate-200 bg-slate-50/60">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-lg bg-white text-sm font-semibold text-[#2563EB] shadow-sm transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
              disabled={isDisabled}
            >
              📞 Appeler
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-lg bg-white text-sm font-semibold text-[#2563EB] shadow-sm transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
              disabled={isDisabled}
            >
              💬 Envoyer un message rapide
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              disabled={isDisabled}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Écrire un message au chauffeur…"
              className="h-11 flex-1 rounded-lg border-slate-200 bg-white text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
            />
            <Button
              type="submit"
              className="h-11 min-w-[44px] rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
              disabled={isDisabled || message.trim().length === 0}
            >
              Envoyer
            </Button>
          </form>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="h-10 text-sm text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
            >
              Fermer
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ContactDriverDrawer;
