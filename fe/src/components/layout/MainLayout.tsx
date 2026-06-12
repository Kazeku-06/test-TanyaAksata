import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

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
    <div className="min-h-screen flex flex-col bg-[#f0f7ff]">
      <Navbar />
      <div className="flex-1 flex">
        <div className="max-w-[1264px] mx-auto w-full flex gap-0">
          {/* Left sidebar */}
          {showSidebar && <Sidebar />}

          {/* Main content */}
          <main className="flex-1 min-w-0 border-l border-r border-blue-200 bg-white">
            <div className="max-w-full">{children}</div>
          </main>

          {/* Right sidebar */}
          {rightSidebar && (
            <aside className="hidden lg:block w-[300px] flex-shrink-0 px-4 pt-4">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
      {showSidebar && <Footer />}
    </div>
  );
}
