interface LoadingProps {
  size?: "small" | "medium" | "large";
}

const Loading = ({ size = "medium" }: LoadingProps) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-[var(--text-primary)] ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Loading;
