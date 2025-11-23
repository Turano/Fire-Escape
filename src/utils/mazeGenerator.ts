import { Cell } from "../types";

const rows = 25;
const cols = 25;

const index = (x: number, y: number) => y * cols + x;

function neighbors(cell: Cell, grid: Cell[]) {
  const list: { cell: Cell; direction: string }[] = [];
  const { x, y } = cell;

  if (y > 0) list.push({ cell: grid[index(x, y - 1)], direction: "top" });
  if (x < cols - 1)
    list.push({ cell: grid[index(x + 1, y)], direction: "right" });
  if (y < rows - 1)
    list.push({ cell: grid[index(x, y + 1)], direction: "bottom" });
  if (x > 0) list.push({ cell: grid[index(x - 1, y)], direction: "left" });

  return list;
}

export function buildMaze(rows = 25, cols = 25): Cell[] {
  const grid: Cell[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid.push({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
      });
    }
  }

  const stack: Cell[] = [];
  const visited = new Set<string>();

  const startCell = grid[0];
  stack.push(startCell);
  visited.add(`0-0`);

  while (stack.length) {
    const current = stack.pop()!;
    const possible = neighbors(current, grid).filter(
      (n) => !visited.has(`${n.cell.x}-${n.cell.y}`)
    );

    if (possible.length > 0) {
      stack.push(current);
      const next = possible[Math.floor(Math.random() * possible.length)];
      visited.add(`${next.cell.x}-${next.cell.y}`);

      if (next.direction === "top") {
        current.walls.top = false;
        next.cell.walls.bottom = false;
      } else if (next.direction === "right") {
        current.walls.right = false;
        next.cell.walls.left = false;
      } else if (next.direction === "bottom") {
        current.walls.bottom = false;
        next.cell.walls.top = false;
      } else if (next.direction === "left") {
        current.walls.left = false;
        next.cell.walls.right = false;
      }

      stack.push(next.cell);
    }
  }

  return grid;
}

export { index };

