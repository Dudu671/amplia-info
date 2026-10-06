import { useEffect, useId, useRef, useState } from "react";
import "../styles/components/dropdown.scss";

export default function Dropdown({ id, name, value, options, placeholder, disabled = false, onChange, }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const menuId = `${controlId}-options`;
  const rootRef = useRef(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const [menuMaxHeight, setMenuMaxHeight] = useState(216);
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0,);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  function openMenu() {
    if (disabled || options.length === 0) return;

    const triggerRect = rootRef.current.getBoundingClientRect();
    const gap = 6;
    const preferredHeight = Math.min(options.length * 34 + 8, 216);
    const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
    const spaceAbove = triggerRect.top - gap;
    const shouldOpenUp = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;

    setPlacement(shouldOpenUp ? "top" : "bottom");
    setMenuMaxHeight(Math.max(80, Math.min(preferredHeight, availableSpace)));
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function selectOption(option) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (disabled || options.length === 0) return;

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openMenu();
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((currentIndex) => {
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0) return options.length - 1;
        if (nextIndex >= options.length) return 0;
        return nextIndex;
      });
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`dropdown${isOpen ? " dropdown--open" : ""}${placement === "top" ? " dropdown--top" : ""
        }`}
    >
      <input type="hidden" name={name} value={value} />

      <button
        id={controlId}
        type="button"
        className={`dropdown__trigger${selectedOption ? "" : " dropdown__trigger--placeholder"
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-activedescendant={
          isOpen ? `${menuId}-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <img
          src="/assets/saude/hospitais/select-chevron.svg"
          alt=""
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={menuId}
          className="dropdown__menu"
          role="listbox"
          style={{ "--dropdown-menu-max-height": `${menuMaxHeight}px` }}
        >
          {options.map((option, index) => (
            <li key={option.value} role="none">
              <button
                id={`${menuId}-${index}`}
                type="button"
                className={`dropdown__option${index === activeIndex ? " dropdown__option--active" : ""
                  }`}
                role="option"
                aria-selected={option.value === value}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
