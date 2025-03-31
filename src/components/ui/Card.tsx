import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
