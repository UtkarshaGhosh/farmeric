import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (import.meta.env.DEV) {
  const origWarn = console.warn.bind(console);
  console.warn = (...args: any[]) => {
    const first = args[0];
    const msg = typeof first === 'string' ? first : '';
    if (msg.includes('[mobx.array] Attempt to read an array index')) return;
    return origWarn(...args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
