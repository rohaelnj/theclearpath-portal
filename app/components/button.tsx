import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button({
  children,
  onClick,
  href,
  type = "button",
  className = "",
}: ButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        className={
          "bg-[#1F4142] text-[#DFD6C7] px-6 py-3 rounded-lg font-bold hover:bg-[#20494b] transition " +
          className
        }
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        "bg-[#1F4142] text-[#DFD6C7] px-6 py-3 rounded-lg font-bold hover:bg-[#20494b] transition " +
        className
      }
    >
      {children}
    </button>
  );
}
