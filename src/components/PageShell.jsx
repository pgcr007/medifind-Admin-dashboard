export default function PageShell({ title, action, children }) {
  return (
    <div className="px-10 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-7">
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}