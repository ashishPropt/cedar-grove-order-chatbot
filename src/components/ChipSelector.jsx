import React, { useState } from 'react';
import './ChipSelector.css';

export default function ChipSelector({ options, onSelect, multi = false, disabled = false }) {
  const [selected, setSelected] = useState([]);

  const toggle = (opt) => {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  if (multi) {
    return (
      <div className="chip-selector">
        <p className="chip-selector__hint">Select all that apply, then tap Confirm</p>
        <div className="chip-selector__chips">
          {options.map(([label, price]) => {
            const display = price > 0 ? `${label} (+$${price.toFixed(2)})` : label;
            return (
              <button
                key={label}
                className={`chip ${selected.includes(label) ? 'chip--selected' : ''}`}
                onClick={() => !disabled && toggle(label)}
                disabled={disabled}
              >
                {display}
              </button>
            );
          })}
        </div>
        <button
          className="chip-selector__confirm"
          onClick={() => !disabled && onSelect(selected)}
          disabled={disabled}
        >
          Confirm selection
        </button>
      </div>
    );
  }

  return (
    <div className="chip-selector">
      <div className="chip-selector__chips">
        {options.map(([label, price]) => {
          const display = price > 0 ? `${label} (+$${price.toFixed(2)})` : label;
          return (
            <button
              key={label}
              className="chip"
              onClick={() => !disabled && onSelect(label, price)}
              disabled={disabled}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );
}
