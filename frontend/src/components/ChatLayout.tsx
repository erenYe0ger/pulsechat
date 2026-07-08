import type { ReactNode } from "react";

interface ChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

function ChatLayout({ sidebar, children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-white text-slate-950 dark:bg-slate-950 dark:text-white md:flex-row">
      <aside className="h-80 w-full shrink-0 overflow-y-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:h-full md:w-80 md:border-b-0 md:border-r">
        {sidebar}
      </aside>

      <main className="min-h-0 flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 md:bg-white md:dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}

export default ChatLayout;
