import { useState, type ReactNode } from "react";
import type { AppPage } from "../../App";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import "./layout.css";

interface AppShellProps { activePage: AppPage; children: ReactNode; onNavigate: (page: AppPage) => void; }

export function AppShell({ activePage, children, onNavigate }: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    function navigate(page: AppPage) { onNavigate(page); setIsSidebarOpen(false); }
    return <div className={`app-shell ${isCollapsed ? "app-shell--collapsed" : ""}`}>
        <Sidebar activePage={activePage} isOpen={isSidebarOpen} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((collapsed) => !collapsed)} onClose={() => setIsSidebarOpen(false)} onNavigate={navigate} />
        {isSidebarOpen && <button aria-label="Close navigation" className="app-shell__backdrop" onClick={() => setIsSidebarOpen(false)} />}
        <div className="app-shell__workspace"><Header activePage={activePage} onMenuClick={() => setIsSidebarOpen(true)} /><main className="app-shell__content">{children}</main></div>
    </div>;
}
