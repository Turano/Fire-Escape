import { useEffect } from "react";
import MazeCanvas from "./components/MazeCanvas";

export default function App() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        background: "#111",
        padding: "20px",
        color: "#eee",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      <MazeCanvas />
    </div>
  );
}

