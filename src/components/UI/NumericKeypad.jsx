import './NumericKeypad.css';

const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];

export function NumericKeypad({ value, onChange, onConfirm, maxLength = 8, placeholder = 'Ingresá tu DNI' }) {
  const handleKey = (k) => {
    if (k === '⌫') {
      onChange(value.slice(0, -1));
    } else if (k === '✓') {
      onConfirm && onConfirm();
    } else {
      if (value.length < maxLength) onChange(value + k);
    }
  };

  return (
    <div className="keypad-container">
      <div className="keypad-display">
        <span className="keypad-display-value">
          {value || <span className="keypad-placeholder">{placeholder}</span>}
        </span>
        {value && <span className="keypad-cursor" />}
      </div>
      <div className="keypad-grid">
        {KEYS.map((k) => (
          <button
            key={k}
            className={`keypad-btn ${k === '✓' ? 'keypad-btn-confirm' : ''} ${k === '⌫' ? 'keypad-btn-delete' : ''}`}
            onClick={() => handleKey(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
