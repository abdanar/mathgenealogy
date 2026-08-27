"use client";

import { useRef, useState } from "react";
import { SearchBar } from "@/components/SearchBar";

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function closeSearch() {
    setIsOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus());
  }

  if (isOpen) {
    return <SearchBar autoFocus compact onEscape={closeSearch} />;
  }

  return (
    <button
      aria-label="Open search"
      className="header-search-toggle"
      ref={toggleRef}
      type="button"
      onClick={() => setIsOpen(true)}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="5.8" />
        <path d="m15.2 15.2 4.3 4.3" />
      </svg>
    </button>
  );
}