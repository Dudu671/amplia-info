import { useEffect, useId, useRef, useState } from "react";
import "../styles/components/dropdown.scss";

function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function Dropdown({ id, name, value, options, placeholder, disabled = false, onChange, icon }) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const menuId = `${controlId}-options`;
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);
    const optionRefs = useRef([]);
    const selectedOption = options.find((option) => option.value === value);
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState("bottom");
    const [menuMaxHeight, setMenuMaxHeight] = useState(260);
    const [activeIndex, setActiveIndex] = useState(0);
    const [query, setQuery] = useState("");
    const filteredOptions = options.filter((option) => normalizeText(option.label).includes(normalizeText(query)));

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!rootRef.current?.contains(event.target)) closeMenu();
        }

        document.addEventListener("pointerdown", handleOutsideClick);
        return () => document.removeEventListener("pointerdown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (disabled) closeMenu();
    }, [disabled]);

    useEffect(() => {
        if (isOpen) searchRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        const option = optionRefs.current[activeIndex];
        const list = listRef.current;
        if (!isOpen || !option || !list) return;

        const optionTop = option.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
        const optionBottom = optionTop + option.offsetHeight;
        if (optionTop < list.scrollTop) list.scrollTop = optionTop;
        if (optionBottom > list.scrollTop + list.clientHeight) list.scrollTop = optionBottom - list.clientHeight;
    }, [activeIndex, isOpen, query]);

    function openMenu() {
        if (disabled || options.length === 0) return;

        const triggerRect = rootRef.current.getBoundingClientRect();
        const gap = 6;
        const preferredHeight = Math.min(options.length * 34 + 52, 260);
        const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
        const spaceAbove = triggerRect.top - gap;
        const shouldOpenUp = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
        const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;

        setQuery("");
        setPlacement(shouldOpenUp ? "top" : "bottom");
        setMenuMaxHeight(Math.max(100, Math.min(preferredHeight, availableSpace)));
        setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
        setIsOpen(true);
    }

    function closeMenu(restoreFocus = false) {
        setIsOpen(false);
        setQuery("");
        if (restoreFocus) triggerRef.current?.focus();
    }

    function selectOption(option) {
        onChange(option.value);
        closeMenu(true);
    }

    function moveActiveOption(direction) {
        if (filteredOptions.length === 0) return;

        setActiveIndex((currentIndex) => {
            const nextIndex = currentIndex + direction;
            if (nextIndex < 0) return filteredOptions.length - 1;
            if (nextIndex >= filteredOptions.length) return 0;
            return nextIndex;
        });
    }

    function handleTriggerKeyDown(event) {
        if (disabled || options.length === 0) return;

        if (event.key === "Escape") closeMenu();
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) return openMenu();
            moveActiveOption(event.key === "ArrowDown" ? 1 : -1);
        }
    }

    function handleSearchKeyDown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu(true);
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            moveActiveOption(event.key === "ArrowDown" ? 1 : -1);
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (filteredOptions[activeIndex]) selectOption(filteredOptions[activeIndex]);
        }
    }

    function handleSearch(event) {
        setQuery(event.target.value);
        setActiveIndex(0);
    }

    function handleBlur(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
    }

    return (
        <div ref={rootRef} onBlur={handleBlur} className={`dropdown${isOpen ? " dropdown--open" : ""}${placement === "top" ? " dropdown--top" : ""}`}>
            <input type="hidden" name={name} value={value} />

            <button ref={triggerRef} id={controlId} type="button" disabled={disabled}
                className={`dropdown__trigger${selectedOption ? "" : " dropdown__trigger--placeholder"}`}
                aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={isOpen ? menuId : undefined}
                onClick={() => isOpen ? closeMenu() : openMenu()} onKeyDown={handleTriggerKeyDown}>
                {icon && <img src={icon} alt="" aria-hidden="true" />}
                <span>{selectedOption?.label ?? placeholder}</span>
                <img className="dropdown__chevron" src="/assets/saude/hospitais/select-chevron.svg" alt="" aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="dropdown__menu" style={{ "--dropdown-menu-max-height": `${menuMaxHeight}px` }}>
                    <input ref={searchRef} className="dropdown__search" type="search" role="combobox" value={query}
                        placeholder="Pesquisar..." aria-label="Pesquisar opções" aria-expanded="true" aria-autocomplete="list"
                        aria-controls={menuId} aria-activedescendant={filteredOptions[activeIndex] ? `${menuId}-${activeIndex}` : undefined}
                        onChange={handleSearch} onKeyDown={handleSearchKeyDown} />

                    <ul ref={listRef} id={menuId} className="dropdown__options" role="listbox" tabIndex={-1} aria-labelledby={controlId}>
                        {filteredOptions.map((option, index) => (
                            <li key={option.value} role="none">
                                <button ref={(element) => { optionRefs.current[index] = element; }}
                                    id={`${menuId}-${index}`} type="button" tabIndex={-1} role="option" aria-selected={option.value === value}
                                    className={`dropdown__option${index === activeIndex ? " dropdown__option--active" : ""}`}
                                    onPointerMove={() => setActiveIndex(index)} onClick={() => selectOption(option)}>
                                    {option.label}
                                </button>
                            </li>
                        ))}
                        {filteredOptions.length === 0 && <li className="dropdown__empty">Nenhuma opção encontrada.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
