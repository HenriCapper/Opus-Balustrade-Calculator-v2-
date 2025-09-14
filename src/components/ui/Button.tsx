type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({
  children,
  disabled,
  onClick,
  className = "",
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
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
