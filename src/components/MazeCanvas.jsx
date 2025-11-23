import { useEffect, useRef, useState } from "react";
import { buildMaze } from "../utils/mazeGenerator";
import { drawMaze } from "../utils/draw";
import { runBFS } from "../utils/bfs";

const rows = 25;
const cols = 25;
const cellSize = 25;

export default function Maze() {
  const canvasRef = useRef(null);

  const [grid, _setGrid] = useState(() => buildMaze(rows, cols));
  const [start, setStart] = useState(null);
  const [exits, setExits] = useState([]);
  const [exitCount, setExitCount] = useState(2);
  const [difficulty, setDifficulty] = useState("medio");
  const [burning, setBurning] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);
  const [finalPath, setFinalPath] = useState([]);
  const [canvasSize, setCanvasSize] = useState(rows * cellSize);

  useEffect(() => {
    if (grid.length && canvasRef.current) {
      requestAnimationFrame(() => {
        drawMaze(
          canvasRef.current,
          grid,
          finalPath,
          new Set(),
          start,
          exits,
          burning,
          false
        );
      });
    }
  }, [grid, start, exits, burning, finalPath, canvasSize]);

  useEffect(() => {
    function updateSize() {
      const margin = 16;
      const controlsHeight = 160;
      const w = window.innerWidth - margin;
      const h = window.innerHeight - controlsHeight;
      const size = Math.max(100, Math.floor(Math.min(w, h)));
      setCanvasSize(size);
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  function handleClick(e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const x = Math.floor(Math.min(Math.max(relX * cols, 0), cols - 1));
    const y = Math.floor(Math.min(Math.max(relY * rows, 0), rows - 1));
    setStart({ x, y });
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function startBFS() {
    if (!start || !canvasRef.current) return;
    setRunning(true);

    const positions = [];
    for (let x = 0; x < cols; x++) {
      positions.push({ x, y: 0 });
      positions.push({ x, y: rows - 1 });
    }
    for (let y = 1; y < rows - 1; y++) {
      positions.push({ x: 0, y });
      positions.push({ x: cols - 1, y });
    }
    const chosenExits = shuffle(positions.slice()).slice(
      0,
      Math.max(1, Math.min(4, exitCount))
    );
    setExits(chosenExits);

    const sx = Math.floor(Math.random() * cols);
    const sy = Math.floor(Math.random() * rows);
    const burningSet = new Set([`${sx}-${sy}`]);
    setBurning(burningSet);

    setMessage(null);
    setFinalPath([]);
    const playerStepMs = 40;
    const fireSpreadMs =
      difficulty === "extremo" ? playerStepMs * 2 : playerStepMs * 4;

    runBFS(
      start,
      chosenExits,
      grid,
      canvasRef.current,
      burningSet,
      (result) => {
        setRunning(false);
        setBurning(new Set(result.burning));

        if (result.success) {
          setMessage("Escapou com segurança!");
          setFinalPath(result.path || []);
        } else {
          setMessage("Não conseguiu escapar!");
          setFinalPath([]);
        }
      },
      fireSpreadMs
    );
  }
  return (
    <div
      style={{ width: "100%", maxWidth: canvasSize, boxSizing: "border-box" }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={handleClick}
        style={{
          border: "2px solid black",
          cursor: "pointer",
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <label>
          Dificuldade:
          <select
            value={difficulty}
            onChange={(e) => {
              const d = e.target.value;
              setDifficulty(d);
              const map = {
                "muito-facil": 3,
                medio: 2,
                dificil: 1,
                extremo: 1,
              };
              setExitCount(map[d]);
            }}
            style={{ marginLeft: "8px" }}
            disabled={running}
          >
            <option value="muito-facil">Muito fácil (3 saídas)</option>
            <option value="medio">Médio (2 saídas)</option>
            <option value="dificil">Difícil (1 saída)</option>
            <option value="extremo">
              Extremo (1 saída, fogo tão rápido quanto jogador)
            </option>
          </select>
        </label>
        <button onClick={startBFS} disabled={running || !start}>
          Iniciar Simulação
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        {message && (
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>{message}</div>
        )}
        <p>🟥 Clique Esquerdo → Define início</p>
        <p>🟩 Saídas são geradas aleatoriamente nas bordas</p>
      </div>
    </div>
  );
}

