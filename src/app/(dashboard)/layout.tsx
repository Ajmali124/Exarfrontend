
import BottomNav from "./_components/bottomnavbar";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { dashboardTheme } from "@/lib/theme-utils";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className={`min-h-screen h-full relative flex ${dashboardTheme.content.default} ${dashboardTheme.text.primary}`}>
      {/* Desktop Sidebar - Now minimal (72px) and expandable */}
      <Sidebar />
      
      {/* Main Content and Navbar */}
      <div className="flex flex-col w-full md:pl-[72px] transition-all duration-300">
        {/* Mobile Navbar */}
        <div className="z-90">
          <Navbar />
        </div>
        {/* Main Content */}
        <main className={`pb-20 overflow-y-auto overflow-x-hidden ${dashboardTheme.content.default}`}>
          {/* Gradient Background for Main Content */}
          <div className="flex-none">
            {/* Main Content Children */}
            {children}
          </div>
        </main>
      </div>
      <div
        className="md:hidden fixed inset-x-0 bottom-0"
        style={{ position: "fixed", bottom: 63, width: "100%", zIndex: 999 }}
      >
        {/* <News /> */}
      </div>
      <div
        className="md:hidden fixed inset-x-0 bottom-0"
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          zIndex: 999,
          height: "57px",
        }}
      >
        <BottomNav />
      </div>
    </div>
  );
};

export default ProtectedLayout;
