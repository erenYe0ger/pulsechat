interface TypingIndicatorProps {
  isVisible: boolean;
  userName: string;
}

function TypingIndicator({ isVisible, userName }: TypingIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
      <span>{userName} is typing</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 delay-150 dark:bg-slate-500" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 delay-300 dark:bg-slate-500" />
      </span>
    </div>
  );
}

export default TypingIndicator;
