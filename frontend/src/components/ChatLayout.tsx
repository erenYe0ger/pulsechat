import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ChatLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

function ChatLayout({ sidebar, children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-white text-slate-950 dark:bg-slate-950 dark:text-white md:flex-row">
      <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:w-80 md:border-b-0 md:border-r">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="text-base font-semibold text-slate-950 dark:text-white">
            PulseChat
          </span>
          <Link
            aria-label="Settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            to="/settings"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>

        <div className="min-h-0 flex-1">{sidebar}</div>
      </aside>

      <main className="min-h-0 flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 md:bg-white md:dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}

export default ChatLayout;
