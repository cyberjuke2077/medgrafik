import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navigation({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navigationLinks = useMemo(
    () => [
      { path: "/dashboard", label: "Дашборд", icon: "📊", roles: ["admin", "registrar", "doctor"] },
      { path: "/schedule", label: "Расписание", icon: "📅", roles: ["admin", "doctor"] },
      { path: "/appointments", label: "Записи", icon: "📋", roles: ["admin", "registrar"] },
      { path: "/reports", label: "Отчёты", icon: "📈", roles: ["admin"] },
      { path: "/doctors", label: "Врачи", icon: "👨‍⚕️", roles: ["admin"] }
    ],
    []
  );

  const visibleLinks = navigationLinks.filter((link) => link.roles.includes(user?.role));

  const handleAskLogout = () => setConfirmOpen(true);

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    logout();
    navigate("/login");
  };

  const handleCancelLogout = () => setConfirmOpen(false);

  const roleText =
    user?.role === "admin"
      ? "Администратор"
      : user?.role === "doctor"
      ? "Врач"
      : user?.role === "registrar"
      ? "Регистратор"
      : user?.role;

  // UX: close on ESC + lock body scroll while modal is open
  useEffect(() => {
    if (!confirmOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCancelLogout();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [confirmOpen]);

  return (
    <>
      <aside
        className={[
          open ? "w-72" : "w-24",
          "bg-white transition-all duration-300 flex flex-col shadow-lg"
        ].join(" ")}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {open && (
            <div>
              <h1 className="text-xl font-bold text-primary-600">МедГрафик</h1>
              <p className="text-xs text-slate-500">Система расписания</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors w-10 h-10 grid place-items-center"
            aria-label="Toggle sidebar"
          >
            {open ? "←" : "→"}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={[
                "flex items-center gap-3 px-4 py-3 transition-colors rounded-[22px]",
                isActive(link.path)
                  ? "bg-primary-50 text-primary-700 font-semibold border border-primary-100"
                  : "text-slate-700 hover:bg-slate-100"
              ].join(" ")}
            >
              <span className="text-lg">{link.icon}</span>
              {open && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {open && (
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{roleText}</p>
            </div>
          )}

          <button type="button" onClick={handleAskLogout} className="w-full btn-danger text-sm py-3">
            {open ? "Выход" : "←"}
          </button>
        </div>
      </aside>

      {/* Logout confirm modal (smaller) */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Подтверждение выхода"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCancelLogout();
          }}
        >
          <div className="w-full max-w-xs bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900">Выйти из системы?</h3>
                <button
                  type="button"
                  onClick={handleCancelLogout}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors grid place-items-center text-slate-700"
                  aria-label="Закрыть"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-3">
                Вы уверены, что хотите завершить сеанс?
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Несохранённые данные могут быть потеряны.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelLogout}
                  className="flex-1 btn-secondary py-2.5"
                >
                  Отмена
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-1 btn-danger py-2.5"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}