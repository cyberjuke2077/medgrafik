import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 250); // дождёмся анимации
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-900",
          icon: "✅",
          accentBg: "bg-green-500"
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-900",
          icon: "❌",
          accentBg: "bg-red-500"
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-900",
          icon: "⚠️",
          accentBg: "bg-yellow-500"
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-900",
          icon: "ℹ️",
          accentBg: "bg-blue-500"
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-900",
          icon: "📝",
          accentBg: "bg-slate-500"
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={[
        "fixed top-6 right-6 z-50 transition-all duration-300 transform",
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-96 opacity-0 scale-95"
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden",
          styles.bg,
          styles.border,
          "border rounded-[26px] p-4 shadow-2xl max-w-md",
          "backdrop-blur bg-opacity-90"
        ].join(" ")}
        style={{ boxShadow: "0 18px 50px rgba(2,6,23,0.18)" }}
      >
        {/* Progress Bar */}
        <div
          className={["absolute top-0 left-0 h-1.5", styles.accentBg, "rounded-b-[10px]"].join(" ")}
          style={{
            width: "100%",
            animation: `slideOut ${duration}ms linear forwards`
          }}
        />

        <div className="flex items-start gap-4 pt-1">
          <div className="text-2xl flex-shrink-0 mt-0.5">{styles.icon}</div>

          <div className="flex-1">
            <p className={[styles.text, "font-semibold break-words"].join(" ")}>{message}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className={[
              "flex-shrink-0 text-xl leading-none",
              styles.text,
              "hover:opacity-70 transition-opacity",
              "w-9 h-9 rounded-full grid place-items-center hover:bg-white/60"
            ].join(" ")}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideOut {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}