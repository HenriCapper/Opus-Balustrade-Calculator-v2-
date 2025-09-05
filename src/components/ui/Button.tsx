type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  disabled,
  onClick,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "rounded-xl bg-sky-400 px-6 py-3 text-sm font-semibold text-white shadow-inner disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
    >
      {children}
    </button>
  );
}
