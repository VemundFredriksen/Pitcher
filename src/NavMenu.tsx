import React, { useState, useEffect, useRef } from "react";

export interface NavItem {
  id: string;
  label: string;
  icon: string; // emoji / unicode symbol
}

interface NavMenuProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ items, activeId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: 12, left: 12, zIndex: 1000 }}
    >
      {/* Hamburger button */}
      <button
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          transition: "background 0.15s",
        }}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            marginTop: 6,
            minWidth: 180,
            background: "rgba(22,22,42,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            backdropFilter: "blur(16px)",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          }}
        >
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  background: isActive
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
                onPointerEnter={(e) =>
                  ((e.target as HTMLElement).style.background =
                    "rgba(255,255,255,0.12)")
                }
                onPointerLeave={(e) =>
                  ((e.target as HTMLElement).style.background = isActive
                    ? "rgba(255,255,255,0.1)"
                    : "transparent")
                }
              >
                <span style={{ fontSize: "1.15rem" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavMenu;
