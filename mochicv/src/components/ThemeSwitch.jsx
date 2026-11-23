// A day/night-style switch between the cute Mochi theme and the plain professional theme.
export default function ThemeSwitch({ pro, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pro}
      aria-label={pro ? "Switch to the cute theme" : "Switch to the professional theme"}
      className={`theme-switch ${pro ? "is-pro" : ""}`}
      onClick={onToggle}
      title={pro ? "Switch to cute mode" : "Switch to professional mode"}
    >
      <span className="ts-label ts-cute">✿ cute</span>
      <span className="ts-label ts-pro">▢ pro</span>
      <span className="ts-knob" aria-hidden="true">{pro ? "▢" : "✿"}</span>
    </button>
  );
}
