import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initOrderSequence, reconcileOrderSequence } from "@/lib/hordeSequence";

if (typeof window !== "undefined") {
  initOrderSequence();
  reconcileOrderSequence();
}

createRoot(document.getElementById("root")!).render(<App />);
