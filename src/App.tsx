import { useEffect, useRef } from "react";
import { startGame } from "./rakillio";

/* A teljes játék (háttér, kérdések, módok) a rakillio.ts fájlban van. */
export default function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stop = startGame(ref.current as HTMLElement);
    return stop;
  }, []);
  return <div ref={ref} />;
}