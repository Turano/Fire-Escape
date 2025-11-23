import { Cell, Point } from "../types";
import { index } from "./mazeGenerator";

const rows = 25;
const cols = 25;

export function drawMaze(
  canvas: HTMLCanvasElement | null,
  grid: Cell[],
  path: Cell[] = [],
  visited: Set<string> = new Set(),
  start: Point | null = null,
  exits: Point[] = [],
  burning: Set<string> = new Set(),
  showExits = true
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const colOffsets: number[] = new Array(cols + 1);
  const rowOffsets: number[] = new Array(rows + 1);
  for (let i = 0; i <= cols; i++) {
    colOffsets[i] = Math.round((i * canvas.width) / cols);
  }
  for (let j = 0; j <= rows; j++) {
    rowOffsets[j] = Math.round((j * canvas.height) / rows);
  }

  function drawCellBG(x: number, y: number, color: string) {
    ctx!.fillStyle = color;
    const px = colOffsets[x];
    const py = rowOffsets[y];
    const w = colOffsets[x + 1] - px;
    const h = rowOffsets[y + 1] - py;
    ctx!.fillRect(px, py, w, h);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  visited.forEach((xy) => {
    const [x, y] = xy.split("-").map(Number);
    drawCellBG(x, y, "#add8f8");
  });

  burning.forEach((xy) => {
    const [x, y] = xy.split("-").map(Number);
    drawCellBG(x, y, "orange");
  });

  for (const cell of path) {
    drawCellBG(cell.x, cell.y, "yellow");
  }

  if (showExits) {
    exits.forEach((e) => drawCellBG(e.x, e.y, "green"));
  }

  if (start) drawCellBG(start.x, start.y, "red");

  ctx.strokeStyle = "black";
  const strokeWidth = Math.max(
    1,
    Math.round(
      Math.min(colOffsets[1] - colOffsets[0], rowOffsets[1] - rowOffsets[0]) *
        0.08
    )
  );
  ctx.lineWidth = strokeWidth;

  for (const cell of grid) {
    const x = colOffsets[cell.x];
    const y = rowOffsets[cell.y];
    const cw = colOffsets[cell.x + 1] - x;
    const ch = rowOffsets[cell.y + 1] - y;

    if (cell.walls.top) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cw, y);
      ctx.stroke();
    }
    if (cell.walls.right) {
      ctx.beginPath();
      ctx.moveTo(x + cw, y);
      ctx.lineTo(x + cw, y + ch);
      ctx.stroke();
    }
    if (cell.walls.bottom) {
      ctx.beginPath();
      ctx.moveTo(x, y + ch);
      ctx.lineTo(x + cw, y + ch);
      ctx.stroke();
    }
    if (cell.walls.left) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + ch);
      ctx.stroke();
    }
  }
}

