import { useEffect, useRef, useState } from "react";
import "../styles/CodeDrawer.css";

type DrawerTab = "all-in-one" | "hook";

export interface CodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** LPM display name shown in the header, e.g. "iDEAL" */
  title: string;
  /** Code for the recommended all-in-one button pattern */
  allInOneCode: string;
  /** Code for the advanced hook + standalone button pattern */
  hookCode: string;
}

/**
 * Slide-over panel that displays merchant integration code for an LPM.
 *
 * - Slides in from the right with a smooth animation.
 * - Two tabs: "All-in-one button (Recommended)" and "Hook + standalone button".
 * - Copy-to-clipboard button per tab.
 * - Closes on: X button click, overlay click, or Escape key.
 */
export default function CodeDrawer({
  isOpen,
  onClose,
  title,
  allInOneCode,
  hookCode,
}: CodeDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("all-in-one");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const activeCode = activeTab === "all-in-one" ? allInOneCode : hookCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed overlay — click to close */}
      <div
        className="code-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="code-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-drawer-title"
      >
        {/* Header */}
        <div className="code-drawer-header">
          <h2 className="code-drawer-title" id="code-drawer-title">
            {title} — Integration Code
          </h2>
          <button
            className="code-drawer-close"
            onClick={onClose}
            aria-label="Close code drawer"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          className="code-drawer-tabs"
          role="tablist"
          aria-label="Code patterns"
        >
          <button
            role="tab"
            aria-selected={activeTab === "all-in-one"}
            className={`code-drawer-tab${activeTab === "all-in-one" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("all-in-one");
              setCopied(false);
            }}
          >
            All-in-one button (Recommended)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "hook"}
            className={`code-drawer-tab${activeTab === "hook" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("hook");
              setCopied(false);
            }}
          >
            Hook + standalone button
          </button>
        </div>

        {/* Code */}
        <div className="code-drawer-body">
          <button
            className={`code-drawer-copy${copied ? " copied" : ""}`}
            onClick={handleCopy}
            aria-live="polite"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          <code className="code-drawer-code">{activeCode}</code>
        </div>
      </div>
    </>
  );
}
