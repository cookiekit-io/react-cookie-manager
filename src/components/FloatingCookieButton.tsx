import React, { useState } from "react";
import { CookieConsenterClassNames } from "../types/types";
import { cn } from "../utils/cn";
import type { CookieTheme } from "../utils/themes";

interface FloatingCookieButtonProps {
  theme?: CookieTheme;
  onClick: () => void;
  onClose?: () => void;
  classNames?: CookieConsenterClassNames;
}

export const FloatingCookieButton: React.FC<FloatingCookieButtonProps> = ({
  theme = "light",
  onClick,
  onClose,
  classNames,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cookie-theme={theme}
      className={
        classNames?.floatingButton
          ? cn(classNames.floatingButton)
          : cn(`
              fixed bottom-6 left-6 z-[99999]
              rcm-floating-button w-12 h-12 rounded-full
              flex items-center justify-center
              transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              hover:scale-110 focus:outline-none
              group cursor-pointer
            `)
      }
      style={{
        animation:
          "slide-in-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      }}
      aria-label="Manage cookie preferences"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      {/* Close button */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className={
            classNames?.floatingButtonCloseButton
              ? cn(classNames.floatingButtonCloseButton)
              : cn(`
                  fixed -top-2 -right-2
                  rcm-floating-close w-6 h-6 rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110
                `)
          }
          aria-label="Close cookie button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
          </svg>
        </button>
      )}
      <style>
        {`
          @keyframes slide-in-bottom {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <svg
        width="24"
        height="24"
        viewBox="0 0 100 100"
        fill="currentColor"
        className="transform rotate-0 hover:rotate-12 transition-transform duration-300"
      >
        {/* Chocolate chips */}
        <circle cx="45.6" cy="24.1" r="4" />
        <circle cx="52.3" cy="49.9" r="4" />
        <circle cx="27.4" cy="59.1" r="4" />
        <circle cx="27.4" cy="37.3" r="4" />
        <circle cx="40.6" cy="76.6" r="4" />
        <circle cx="69.5" cy="71.6" r="4" />

        {/* Main cookie shape with bite mark */}
        <path
          d="
            M48.9 95.5c-24 0-44-18.7-45.5-42.7C2.6 39.7 7.6 26.8 17 17.5c9.5-9.3 22.5-14 35.6-13
            c4.3 0.4 8.6 1.3 12.6 2.9c0.7 0.3 1.2 0.9 1.3 1.6c0.1 0.7-0.2 1.4-0.7 1.9c-1.4 1.2-2.2 2.9-2.2 4.7
            c0 1.8 0.8 3.6 2.2 4.7c0.4 0.3 0.7 0.9 0.7 1.4c0 0.5-0.1 1.1-0.5 1.5c-1 1.1-1.6 2.6-1.6 4.1
            c0 1.9 0.9 3.7 2.5 4.9c0.5 0.4 0.8 1 0.8 1.6c0 0.6-0.3 1.2-0.8 1.6c-1.6 1.2-2.5 3-2.5 4.9
            c0 3.4 2.7 6.1 6.1 6.1l0.2 0c0.9 0 1.7 0.6 2 1.4c0.8 2.6 3.2 4.4 5.8 4.4c1.6 0 3.1-0.6 4.3-1.8
            c0.5-0.5 1.3-0.7 2-0.5c0.7 0.2 1.2 0.7 1.4 1.4c0.7 2.5 2.9 4.3 5.5 4.5c0.6 0 1.1 0.3 1.5 0.8
            c0.3 0.4 0.5 1 0.4 1.6C89.8 79.8 70.9 95.5 48.9 95.5z
            M49 8.3c-10.8 0-21.3 4.3-29.1 12C11.2 28.8 6.6 40.6 7.4 52.6C8.8 74.4 27 91.5 48.9 91.5
            c19.4 0 36.2-13.4 40.5-32.1c-2.4-0.7-4.5-2.3-5.8-4.5c-1.5 0.8-3.1 1.2-4.9 1.2c-4 0-7.5-2.4-9.2-5.9
            c-5.1-0.5-9-4.8-9-10c0-2.4 0.8-4.7 2.4-6.5c-1.5-1.8-2.4-4.1-2.4-6.5c0-1.8 0.5-3.6 1.5-5.2
            c-1.5-1.8-2.4-4.1-2.4-6.5c0-1.9 0.5-3.8 1.5-5.3c-2.9-0.9-5.8-1.5-8.8-1.7C51.2 8.4 50.1 8.3 49 8.3z
          "
        />

        {/* Cookie texture lines */}
        <g opacity="0.3">
          <path
            d="M35 30 Q 40 35 45 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M50 60 Q 55 65 60 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M30 50 Q 35 55 40 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M45 70 Q 50 75 55 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
