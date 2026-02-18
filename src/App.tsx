import { useState } from "react";
import NavMenu from "./NavMenu";
import type { NavItem } from "./NavMenu";
import PracticePage from "./PracticePage";
import ToneQuizPage from "./ToneQuizPage";
import ListenerPage from "./ListenerPage";
import AboutPage from "./AboutPage";

const NAV_ITEMS: NavItem[] = [
  { id: "practice", label: "Free Play", icon: "🎹" },
  { id: "quiz", label: "Tone Quiz", icon: "🎯" },
  { id: "listener", label: "Note Listener", icon: "🎤" },
  { id: "about", label: "About", icon: "ℹ️" },
];

function App() {
  const [page, setPage] = useState("practice");

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#111",
      }}
    >
      <NavMenu items={NAV_ITEMS} activeId={page} onSelect={setPage} />

      {page === "practice" && <PracticePage />}
      {page === "quiz" && <ToneQuizPage />}
      {page === "listener" && <ListenerPage />}
      {page === "about" && <AboutPage />}
    </div>
  );
}

export default App;
