const VARIANTS = {
  success: "bg-sage-light text-sage border-sage/40",
  warning: "bg-amber-light/40 text-amber border-amber/40",
  danger: "bg-rust-light text-rust border-rust/40",
  neutral: "bg-paper-dim text-ink-soft border-hairline",
};

export default function Badge({ label, variant = "neutral" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}