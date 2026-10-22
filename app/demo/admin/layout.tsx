import DemoSidebar from "./_components/DemoSidebar";

export const metadata = { title: "Admin Demo — Popkoor Divers" };

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell" style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
      <DemoSidebar />
      <main style={{ flex: 1, overflow: "auto", background: "#F7F6F3" }}>
        {children}
      </main>
    </div>
  );
}
