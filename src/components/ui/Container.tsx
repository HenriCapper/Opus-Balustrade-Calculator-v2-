type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: Props) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur " +
        className
      }
    >
      {children}
    </div>
  );
}
