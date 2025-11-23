import MazeCanvas from "./components/MazeCanvas";

export default function App() {
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

