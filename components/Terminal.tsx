import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Minus, X } from "lucide-react";
import SnakeGame from "./SnakeGame";

interface TerminalProps {
  onClose: () => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
}

const WELCOME_MSG = 'Terminal v1.0.0 - Type "help" for available commands';

export default function Terminal({
  onClose,
  minimized: propMinimized,
  setMinimized: setPropMinimized,
}: TerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([WELCOME_MSG]);
  const [showSnake, setShowSnake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const draggingRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const setInitialPosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const pad = 32;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = rect?.width ?? Math.min(400, vw - pad * 2);
      const height = rect?.height ?? Math.min(384, vh - pad * 2);
      setPos({
        x: Math.max(pad, (vw - width) / 2),
        y: Math.max(pad, (vh - height) / 2),
      });
    };
    setInitialPosition();
    window.addEventListener("resize", setInitialPosition);
    return () => window.removeEventListener("resize", setInitialPosition);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current.dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches?.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e && "clientY" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - draggingRef.current.offsetX;
      const y = clientY - draggingRef.current.offsetY;
      const maxX = vw - rect.width - 16;
      const maxY = vh - rect.height - 16;
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
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let clientX = 0;
    let clientY = 0;
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

  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    const args = command.split(" ");
    const mainCmd = args[0];
    let output = "";
    switch (mainCmd) {
      case "help":
        output = `Available commands:
- ping: Test connectivity
- clear: Clear console
- color [hex/name]: Change terminal color
- close: Close the terminal
- minimize: Minimize the terminal
- echo [text]: Echo text back
- snake: Play snake game`;
        break;
      case "ping":
        output = "Pong! Connection is active.";
        break;
      case "clear":
        setHistory([WELCOME_MSG]);
        return;
      case "color":
        if (args[1]) {
          const newColor = args[1].startsWith("#") ? args[1] : `#${args[1]}`;
          setTerminalColor(newColor);
          output = `Terminal color changed to ${newColor}`;
        } else {
          output = "Usage: color [hex/name]";
        }
        break;
      case "close":
        onClose();
        return;
      case "minimize":
        setPropMinimized(true);
        return;
      case "echo":
        output = args.slice(1).join(" ") || "Usage: echo [text]";
        break;
      case "snake":
        setShowSnake(true);
        output = "Launching Snake Game...";
        inputRef.current?.blur();
        break;
      case "":
        break;
      default:
        output = `Command not found: ${mainCmd}. Type "help" for available commands.`;
    }
    setHistory((prev) => [...prev, `$ ${cmd}`, output]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput("");
    }
  };

  // Minimized bar
  if (propMinimized) {
    return (
      <button
        className="fixed right-8 bottom-8 p-3 z-50 flex items-center justify-center"
        style={{ minWidth: 0, minHeight: 0 }}
        onClick={() => setPropMinimized(false)}
        aria-label="Restore Terminal"
      >
        <TerminalIcon className="w-6 h-6 text-gray-300" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-8">
      <div
        ref={containerRef}
        style={{ left: pos.x, top: pos.y, position: "absolute" }}
        className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-sm h-60 flex flex-col shadow-2xl terminal-font"
      >
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="flex items-center justify-between px-4 py-1 border-b border-zinc-800 cursor-move select-none bg-zinc-900/60"
        >
          <div className="flex items-center gap-2 ml-2">
            <TerminalIcon className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-300">Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => setPropMinimized(true)}
              type="button"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={historyRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          {history.map((line, idx) =>
            line.startsWith("$") ? (
              <div key={idx} className="mt-1 font-mono">
                <span style={{ color: "#10b981" }}>$</span>
                <span className="ml-1 text-[#9AE6B4]">
                  {line.slice(1).trimStart()}
                </span>
              </div>
            ) : (
              <div
                key={idx}
                className="text-gray-400 whitespace-pre-wrap mt-0.5 font-mono"
              >
                {line}
              </div>
            )
          )}
        </div>

        {!showSnake && (
          <form onSubmit={handleSubmit} className="pt-1 pb-2 pl-4 bg-[#0a0a0a]">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span style={{ color: "#10b981" }}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent text-gray-300 outline-none placeholder:text-zinc-500"
                placeholder="Type a command..."
                autoComplete="off"
              />
            </div>
          </form>
        )}
      </div>
      {showSnake && <SnakeGame onClose={() => setShowSnake(false)} retryable />}
    </div>
  );
}

function setTerminalColor(newColor: string) {
  const terminal = document.querySelector(".bg-zinc-950");
  if (terminal) {
    (terminal as HTMLElement).style.backgroundColor = newColor;
  }
}
