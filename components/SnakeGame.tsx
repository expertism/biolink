import React, { useEffect, useRef, useState } from "react";
import { X, Trophy } from "lucide-react";

interface SnakeGameProps {
  onClose: () => void;
  retryable?: boolean;
}

const BOARD_SIZE = 20;
const CELL_SIZE = 12;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const SPEED = 110;

type Food = { x: number; y: number };

function getRandomFood(snake: { x: number; y: number }[]) {
  let food: Food;
  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export default function SnakeGame({ onClose, retryable }: SnakeGameProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() =>
    Number(localStorage.getItem("snake_high") || 0)
  );
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const moveRef = useRef(direction);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);
  const highRef = useRef(high);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    highRef.current = high;
  }, [high]);

  useEffect(() => {
    if (!started || gameOver || paused) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: prev[0].x + moveRef.current.x,
          y: prev[0].y + moveRef.current.y,
        };
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE ||
          prev.some((s) => s.x === newHead.x && s.y === newHead.y)
        ) {
          setGameOver(true);
          if (scoreRef.current > highRef.current) {
            setHigh(scoreRef.current);
            localStorage.setItem("snake_high", String(scoreRef.current));
          }
          return prev;
        }
        let newSnake;
        if (
          newHead.x === foodRef.current.x &&
          newHead.y === foodRef.current.y
        ) {
          newSnake = [newHead, ...prev];
          setFood(getRandomFood(newSnake));
          setScore((s) => s + 1);
        } else {
          newSnake = [newHead, ...prev.slice(0, -1)];
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [gameOver, paused, started]);

  function restart() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setStarted(false);
  }

  const gridLines = [];
  for (let i = 1; i < BOARD_SIZE; i++) {
    gridLines.push(
      <div
        key={`v${i}`}
        style={{
          position: "absolute",
          left: i * CELL_SIZE,
          top: 0,
          width: 1,
          height: BOARD_SIZE * CELL_SIZE,
          background: "#23272e",
          opacity: 0.3,
          zIndex: 1,
        }}
      />,
      <div
        key={`h${i}`}
        style={{
          position: "absolute",
          top: i * CELL_SIZE,
          left: 0,
          height: 1,
          width: BOARD_SIZE * CELL_SIZE,
          background: "#23272e",
          opacity: 0.3,
          zIndex: 1,
        }}
      />
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({
    x: window.innerWidth / 2 - 180,
    y: window.innerHeight / 2 - 180,
  });
  const draggingRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current.dragging || !windowRef.current) return;
      let clientX = 0,
        clientY = 0;
      if ("touches" in e && e.touches?.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e && "clientY" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      const x = clientX - draggingRef.current.offsetX;
      const y = clientY - draggingRef.current.offsetY;
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const rect = windowRef.current.getBoundingClientRect();
      const maxX = vw - rect.width - 8;
      const maxY = vh - rect.height - 8;
      setPos({
        x: Math.max(8, Math.min(x, maxX)),
        y: Math.max(8, Math.min(y, maxY)),
      });
    };
    const onUp = () => {
      if (draggingRef.current.dragging) {
        draggingRef.current.dragging = false;
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    let clientX = 0,
      clientY = 0;
    if ("touches" in e && e.touches?.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e && "clientY" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    draggingRef.current.dragging = true;
    draggingRef.current.offsetX = clientX - rect.left;
    draggingRef.current.offsetY = clientY - rect.top;
    document.body.style.userSelect = "none";
  };

  const transitionStyle = {
    transition: "left 90ms linear, top 90ms linear",
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (started && !gameOver) setPaused((p) => !p);
        return;
      }
      if (gameOver || paused || !started) return;
      switch (e.key) {
        case "ArrowUp":
          if (moveRef.current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (moveRef.current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (moveRef.current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (moveRef.current.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, gameOver]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={windowRef}
        style={{
          left: pos.x,
          top: pos.y,
          position: "absolute",
          width: 320,
          borderRadius: 8,
          border: "1px solid #27272a",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          boxSizing: "border-box",
        }}
        className="pointer-events-auto"
      >
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="flex items-center justify-between w-full px-4 py-1 border-b border-zinc-800 cursor-move select-none bg-zinc-900/60"
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-100 font-medium">snake</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
            tabIndex={0}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="pt-4 pb-8 px-4 flex flex-col items-center ">
          <div className="flex justify-center gap-8 items-center mb-2 w-full">
            <span className="text-green-600 text-base font-mono">
              Score: <span>{score}</span>
            </span>
            <span className="text-yellow-400 text-base font-mono">
              High: <span>{high}</span>
            </span>
          </div>
          <div
            ref={containerRef}
            className="relative mx-auto bg-zinc-950 border border-zinc-800"
            style={{
              width: 240,
              height: 240,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {gridLines}
            {started && (
              <div
                className="absolute"
                style={{
                  left: food.x * CELL_SIZE,
                  top: food.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: "#b91c1c",
                  borderRadius: 2,
                  zIndex: 2,
                  ...transitionStyle,
                }}
              />
            )}
            {started &&
              snake.map((seg, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: seg.x * CELL_SIZE,
                    top: seg.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: "#15803d",
                    borderRadius: 2,
                    zIndex: 3,
                    ...transitionStyle,
                  }}
                />
              ))}
            {!started && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-20">
                <span className="text-gray-100 font-bold text-xl mb-2">
                  SNAKE
                </span>
                <span className="text-gray-400 mb-1 text-center text-sm">
                  Press arrow keys to move
                </span>
                <span className="text-gray-400 mb-3 text-center text-sm">
                  Space to pause/resume
                </span>
                <button
                  className="px-3 py-1 bg-zinc-800 text-gray-100 rounded font-medium text-sm hover:bg-zinc-700 transition"
                  onClick={() => setStarted(true)}
                >
                  Start Game
                </button>
              </div>
            )}
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-20">
                <span className="text-red-500 font-extrabold text-lg uppercase mb-2">
                  GAME OVER
                </span>
                <span className="text-gray-400 text-sm mb-3">
                  Score: {score}
                </span>
                {retryable && (
                  <button
                    className="px-3 py-1 bg-zinc-800 text-gray-100 rounded font-medium text-sm hover:bg-zinc-700 transition"
                    onClick={restart}
                  >
                    Restart
                  </button>
                )}
              </div>
            )}
            {paused && started && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-20">
                <span className="text-yellow-300 font-bold text-lg">
                  Paused
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
