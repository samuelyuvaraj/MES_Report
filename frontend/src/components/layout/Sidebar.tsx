import { BarChart3, ChevronLeft, ChevronRight, ClipboardList, Database, Factory, FileBarChart, Settings, Wrench } from "lucide-react";
import type { AppPage } from "../../App";
import "./Sidebar.css";

interface SidebarProps { activePage: AppPage; isOpen: boolean; isCollapsed: boolean; onClose: () => void; onToggleCollapse: () => void; onNavigate: (page: AppPage) => void; }
const navigationItems: Array<{ label: string; page: AppPage; icon: typeof BarChart3; comingSoon?: boolean }> = [
    { label: "Dashboard", page: "dashboard", icon: BarChart3 }, { label: "Work Orders", page: "work-orders", icon: ClipboardList }, { label: "Reports", page: "reports", icon: FileBarChart }, { label: "Rework & Scrap", page: "rework-scrap", icon: Wrench }, { label: "NC & Defects", page: "nc-defects", icon: Factory, comingSoon: true }, { label: "Master Data", page: "master-data", icon: Database }
];
export function Sidebar({ activePage, isOpen, isCollapsed, onClose, onToggleCollapse, onNavigate }: SidebarProps) {
    return <aside className={`sidebar ${isOpen ? "sidebar--open" : ""} ${isCollapsed ? "sidebar--collapsed" : ""}`}>
        <div className="sidebar__brand"><span className="sidebar__brand-mark"><Factory size={20} /></span><span>Quality Hub</span><button aria-label="Close navigation" className="sidebar__close" onClick={onClose}><ChevronLeft size={20} /></button></div>
        <nav aria-label="Main navigation" className="sidebar__nav"><span className="sidebar__label">OPERATIONS</span>{navigationItems.map(({ label, page, icon: Icon, comingSoon }) => <button title={isCollapsed ? label : undefined} className={`sidebar__link ${activePage === page ? "sidebar__link--active" : ""}`} key={page} onClick={() => onNavigate(page)}><Icon size={18} /><span>{label}</span>{comingSoon && <span className="sidebar__badge">Soon</span>}</button>)}</nav>
        <div className="sidebar__footer"><button title={isCollapsed ? "Settings" : undefined} className={`sidebar__link ${activePage === "settings" ? "sidebar__link--active" : ""}`} onClick={() => onNavigate("settings")}><Settings size={18} /><span>Settings</span></button><button aria-label="Collapse sidebar" className="sidebar__collapse" onClick={onToggleCollapse}>{isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span>Collapse menu</span></button></div>
    </aside>;
}
