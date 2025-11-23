import { useEffect, useRef, useState } from "react";
import { buildMaze } from "../utils/mazeGenerator";
import { drawMaze } from "../utils/draw";
import { runBFS } from "../utils/bfs";

const rows = 25;
const cols = 25;
const cellSize = 25;

function randInt(max) {
  return Math.floor(Math.random() * max);
}

export default function Maze() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [grid, _setGrid] = useState(() => buildMaze(rows, cols));
  const [start, setStart] = useState(null);
  const [exits, setExits] = useState([]);
  const [exitCount, setExitCount] = useState(2);
  const [difficulty, setDifficulty] = useState("medio");
  const [burning, setBurning] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null);
  const [finalPath, setFinalPath] = useState([]);
  const [canvasSize, setCanvasSize] = useState(Math.min(rows * cellSize, 320));
  const [isWide, setIsWide] = useState(false);

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
      const controlsHeight = 160;
      const h = window.innerHeight - controlsHeight;
      let availableW = window.innerWidth;
      const el = containerRef.current;

      let containerW = 0;
      try {
        if (el && typeof el.clientWidth === "number")
          containerW = el.clientWidth || 0;
      } catch (e) {
        void e;
      }

      let parentPadLeft = 0;
      let parentPadRight = 0;
      try {
        const parent =
          el && el.parentElement ? el.parentElement : document.body;
        const ps = window.getComputedStyle(parent);
        parentPadLeft = parseFloat(ps.paddingLeft) || 0;
        parentPadRight = parseFloat(ps.paddingRight) || 0;
      } catch (e) {
        void e;
      }

      const docW = document.documentElement.clientWidth || window.innerWidth;
      const fallbackAvailable = Math.max(
        100,
        Math.floor(docW - parentPadLeft - parentPadRight - 8)
      );

      availableW = Math.max(containerW || 0, fallbackAvailable, 100);

      const widthCap = Math.floor(window.innerWidth * 0.95);
      const heightCap = Math.floor(window.innerHeight * 0.5);

      const wide = availableW >= 600;
      setIsWide(wide);

      const columnWidth = wide
        ? Math.max(100, Math.floor(Math.min(availableW * 0.6, widthCap)))
        : Math.max(100, Math.floor(Math.min(availableW, widthCap)));

      const size = Math.max(
        100,
        Math.floor(Math.min(columnWidth, h, heightCap))
      );

      setCanvasSize(size);
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const pixelSize = Math.max(1, Math.floor(canvasSize * dpr));

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
      try {
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;
      } catch (e) {
        void e;
      }
    }

    drawMaze(canvas, grid, finalPath, new Set(), start, exits, burning, false);
  }, [canvasSize, grid, start, exits, burning, finalPath, isWide]);

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

    const sx = randInt(cols);
    const sy = randInt(rows);
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
        setBurning(new Set(result.burning || []));
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

  function handleClick(e) {
    if (running) return;
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

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "calc(var(--vh, 1vh) * 90)",
        maxWidth: "calc(100vw - 40px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: isWide ? "row" : "column",
        alignItems: "center",
        gap: isWide ? 24 : 0,
        justifyContent: "center",
      }}
    >
      <div>
        <h2 style={{ textAlign: "center", margin: "8px 0", color: "#fff" }}>
          {message || "Consegue escapar do fogo?"}
        </h2>
        <div
          style={{ flexShrink: 0, justifyContent: "center", display: "flex" }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            onMouseDown={handleClick}
            style={{
              border: "2px solid black",
              cursor: "pointer",
              width: `${canvasSize}px`,
              height: `${canvasSize}px`,
              display: "block",
              pointerEvents: running ? "none" : "auto",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: isWide ? "40%" : "100%",
          marginTop: isWide ? 0 : 10,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>Dificuldade:</span>
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
              style={{ marginLeft: "8px", minWidth: 0, maxWidth: "60vw" }}
              disabled={running}
            >
              <option value="muito-facil">Muito fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
              <option value="extremo">Extremo</option>
            </select>
          </label>
          <button
            onClick={startBFS}
            disabled={running || !start}
            style={{
              backgroundColor: running || !start ? "#95d7b6" : "#28a745",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: running || !start ? "not-allowed" : "pointer",
              width: "100%",
              maxWidth: 360,
              boxShadow:
                running || !start ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            Iniciar Simulação
          </button>
        </div>

        <div
          style={{
            marginTop: 8,
            textAlign: isWide ? "left" : "center",
            width: "100%",
          }}
        >
          <p style={{ margin: 4, textAlign: "center" }}>
            🟥 Clique Esquerdo → Define início
          </p>
          <p style={{ margin: 4, textAlign: "center" }}>
            🟩 Saídas são geradas aleatoriamente nas bordas
          </p>
        </div>
      </div>
    </div>
  );
}

