"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.6}
    stroke="currentColor"
    className={cn("h-5 w-5", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const CheckFilled = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-5 w-5", className)}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <ol className="relative flex flex-col gap-3" dir="auto">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.25, 0.25);
        const isDone = index < value;
        const isActive = index === value;

        return (
          <motion.li
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                isDone &&
                  "bg-[color:var(--esap-emerald-700)] text-white",
                isActive &&
                  "bg-[color:var(--badge-emerald-bg)] text-[color:var(--esap-emerald-700)] ring-1 ring-[color:var(--esap-emerald-500)]",
                !isDone &&
                  !isActive &&
                  "bg-[color:var(--bg-surface-subtle)] text-[color:var(--text-tertiary)] ring-1 ring-[color:var(--border-default)]",
              )}
            >
              {isDone ? (
                <CheckFilled className="h-4 w-4" />
              ) : isActive ? (
                <motion.span
                  className="h-2 w-2 rounded-full bg-[color:var(--esap-emerald-600)]"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <CheckIcon className="h-3.5 w-3.5" />
              )}
            </span>
            <span
              className={cn(
                "text-[14px] tracking-[-0.1px]",
                isDone && "text-[color:var(--text-secondary)]",
                isActive &&
                  "font-semibold text-[color:var(--text-primary)]",
                !isDone &&
                  !isActive &&
                  "text-[color:var(--text-tertiary)]",
              )}
            >
              {loadingState.text}
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
  value,
  title,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  value?: number;
  title?: string;
}) => {
  const [currentState, setCurrentState] = useState(0);
  const controlled = typeof value === "number";

  useEffect(() => {
    if (controlled) return;
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1),
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration, controlled]);

  const active = controlled
    ? Math.max(0, Math.min(value!, loadingStates.length - 1))
    : currentState;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--bg-page)]/70 backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-[min(92vw,420px)] rounded-2xl border",
              "border-[color:var(--border-default)] bg-[color:var(--bg-surface)]",
              "px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_40px_-16px_rgba(0,0,0,0.18)]",
            )}
          >
            {title && (
              <div className="mb-4">
                <p
                  className="text-[15px] font-semibold tracking-[-0.2px] text-[color:var(--text-primary)]"
                  dir="auto"
                >
                  {title}
                </p>
              </div>
            )}
            <LoaderCore value={active} loadingStates={loadingStates} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
