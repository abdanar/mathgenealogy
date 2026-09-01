"use client";

import { useEffect, useRef, useState } from "react";
import { SearchBar } from "@/components/SearchBar";

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function closeSearch(restoreFocus = false) {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !searchRef.current?.contains(event.target)) closeSearch();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div className="header-search" ref={searchRef}>
      <button
        aria-label={isOpen ? "Close search" : "Open search"}
        aria-expanded={isOpen}
        className="header-search-toggle"
        ref={toggleRef}
        type="button"
        onClick={() => isOpen ? closeSearch() : setIsOpen(true)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="10.8" cy="10.8" r="5.8" />
          <path d="m15.2 15.2 4.3 4.3" />
        </svg>
      </button>
      {isOpen && <SearchBar autoFocus compact onEscape={() => closeSearch(true)} />}
    </div>
  );
}