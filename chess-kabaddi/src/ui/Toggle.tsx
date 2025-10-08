export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-neutral-300">{label}</span>
      <span
        className={`w-10 h-6 rounded-full ${
          checked ? "bg-brand-600" : "bg-white/10"
        } relative cursor-pointer`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </label>
  );
}
