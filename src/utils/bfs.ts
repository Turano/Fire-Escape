import { Cell, Point } from "../types";
import { index } from "./mazeGenerator";
import { drawMaze } from "./draw";

const rows = 25;
const cols = 25;

export async function runBFS(
  start: Point,
  exits: Point[],
  grid: Cell[],
  canvas: HTMLCanvasElement,
  burning: Set<string>,
  onDone: (result: {
    success: boolean;
    path?: Cell[];
    burning: Set<string>;
  }) => void,
  fireSpreadMs = 350
) {
  const q: Cell[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string>();

  const startCell = grid[index(start.x, start.y)];

  q.push(startCell);
  visited.add(`${start.x}-${start.y}`);

  const dirs = [
    { dx: 0, dy: -1, wall: "top", opposite: "bottom" },
    { dx: 1, dy: 0, wall: "right", opposite: "left" },
    { dx: 0, dy: 1, wall: "bottom", opposite: "top" },
    { dx: -1, dy: 0, wall: "left", opposite: "right" },
  ];

  while (q.length > 0) {
    const current = q.shift()!;
    const now = Date.now();
    if (typeof (runBFS as any)._lastFireTick === "undefined") {
      (runBFS as any)._lastFireTick = now;
    }
    if (now - (runBFS as any)._lastFireTick >= fireSpreadMs) {
      (runBFS as any)._lastFireTick = now;
      const toAdd: string[] = [];
      for (const key of Array.from(burning)) {
        const [bx, by] = key.split("-").map(Number);
        const cell = grid[index(bx, by)];
        if (!cell) continue;

        if (!cell.walls.top && by > 0) toAdd.push(`${bx}-${by - 1}`);
        if (!cell.walls.right && bx < cols - 1) toAdd.push(`${bx + 1}-${by}`);
        if (!cell.walls.bottom && by < rows - 1) toAdd.push(`${bx}-${by + 1}`);
        if (!cell.walls.left && bx > 0) toAdd.push(`${bx - 1}-${by}`);
      }
      for (const k of toAdd) burning.add(k);
    }

    if (burning.has(`${current.x}-${current.y}`)) {
      drawMaze(canvas, grid, [], visited, start, exits, burning, true);
      await new Promise((res) => setTimeout(res, 20));
      continue;
    }

    if (exits.some((e) => e.x === current.x && e.y === current.y)) {
      const path: Cell[] = [];
      let curKey = `${current.x}-${current.y}`;

      while (parent.has(curKey)) {
        const [px, py] = curKey.split("-").map(Number);
        path.push(grid[index(px, py)]);
        curKey = parent.get(curKey)!;
      }

      drawMaze(canvas, grid, path, visited, start, exits, burning, true);
      onDone({ success: true, path, burning });
      return;
    }

    for (const d of dirs) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;

      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (current.walls[d.wall as keyof Cell["walls"]]) continue;

      const key = `${nx}-${ny}`;
      if (burning.has(key)) continue;

      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, `${current.x}-${current.y}`);
        q.push(grid[index(nx, ny)]);
      }
    }

    drawMaze(canvas, grid, [], visited, start, exits, burning, true);
    await new Promise((res) => setTimeout(res, 20));
  }

  drawMaze(canvas, grid, [], visited, start, exits, burning, true);
  onDone({ success: false, burning });
}

