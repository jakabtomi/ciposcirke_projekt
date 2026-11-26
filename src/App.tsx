import { useEffect, useRef } from "react";
import { startGame } from "./game";

/* A teljes játék (háttér, kérdések, módok) a game.ts fájlban van. */
export default function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stop = startGame(ref.current as HTMLElement);
    return stop;
  }, []);
  return <div ref={ref} />;
}