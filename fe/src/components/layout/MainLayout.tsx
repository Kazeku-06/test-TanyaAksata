import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  /** Optional right sidebar content */
  rightSidebar?: React.ReactNode;
  /** Set to false to disable the left sidebar (e.g. auth pages) */
  showSidebar?: boolean;
}

export default function MainLayout({
  children,
  rightSidebar,
  showSidebar = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[1440px] flex gap-6 px-4 sm:px-6 py-6">
          {/* Left sidebar */}
          {showSidebar && <Sidebar />}

          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-hidden">
            <div className="max-w-full">{children}</div>
          </main>

          {/* Right sidebar */}
          {rightSidebar && (
            <aside className="hidden xl:block w-[320px] flex-shrink-0">
              <div className="sticky top-28 space-y-5">{rightSidebar}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
