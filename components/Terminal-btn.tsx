import { useState } from "react";
import Terminal from "./Terminal";
import { Terminal as TerminalIcon } from "lucide-react";

export default function TerminalBtn() {
  const [showTerminal, setShowTerminal] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleButtonClick = () => {
    if (!showTerminal) {
      setShowTerminal(true);
      setMinimized(false);
    } else if (minimized) {
      setMinimized(false);
    } else {
      setMinimized(true);
    }
  };

  const isActive = showTerminal;

  return (
    <>
      <button
        className={`absolute top-1 right-2 w-9 h-9 flex items-center justify-center transition-colors
          ${
            isActive
              ? "text-green-500"
              : "text-gray-400 hover:opacity-80 cursor-pointer"
          }`}
        title="Toggle Terminal"
        onClick={handleButtonClick}
      >
        <TerminalIcon className="w-5 h-5" />
      </button>
      {showTerminal && (
        <Terminal
          onClose={() => {
            setShowTerminal(false);
            setMinimized(false);
          }}
          minimized={minimized}
          setMinimized={setMinimized}
        />
      )}
    </>
  );
}
