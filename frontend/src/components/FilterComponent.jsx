import React, { useState, useRef, useEffect } from "react";

export default function FilterComponent({ children, onApply, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(undefined);
  const buttonRef = useRef(undefined);

  useEffect(() => {
    const handleClick = (event) => {
      const isDropdownClicked =
        dropdownRef.current && dropdownRef.current.contains(event.target);
      const isButtonClicked =
        buttonRef.current && buttonRef.current.contains(event.target);

      if (isDropdownClicked || isButtonClicked) {
        // We would do nothing if the ref is undefined or user clicks on menu.
        return;
      }

      // Or else close the menu.
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    // cleanup
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [dropdownRef, buttonRef]);

  const handleApply = () => {
    onApply();
    setIsOpen(false);
  };

  return (
    <div className="filter_wrapper">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="filter_button"
      >
        {label}
      </button>
      {isOpen && (
        <div ref={dropdownRef} className="filter_dropdown">
          <div>
            {children}
            <div className="filter_dropdown_actions">
              <button
                onClick={() => handleApply()}
                className="filter_dropdown_button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
