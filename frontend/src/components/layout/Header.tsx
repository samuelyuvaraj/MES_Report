import { Bell, ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppPage } from "../../App";
import { IconButton } from "../ui/IconButton";
import { SearchCommand } from "../ui/SearchCommand";
import "./Header.css";
import "./HeaderPolish.css";
interface HeaderProps { activePage: AppPage; onMenuClick: () => void; }
const pageLabels: Record<AppPage, string> = { dashboard: "Dashboard", "work-orders": "Work Orders", reports: "Reports", "rework-scrap": "Rework & Scrap", settings: "Settings", "nc-defects": "NC & Defects", "master-data": "Master Data" };
export function Header({ activePage, onMenuClick }: HeaderProps) {
    const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("qa-theme") === "dark" ? "dark" : "light");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("qa-theme", theme); }, [theme]);
    return <header className="header"><div className="header__title"><IconButton label="Open navigation" className="header__menu" onClick={onMenuClick}><Menu size={21} /></IconButton><div><p className="header__crumb">Production</p><h2>{pageLabels[activePage]}</h2></div></div><div className="header__actions"><SearchCommand onOpen={() => setIsSearchOpen(true)} /><IconButton label="Switch color theme" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}</IconButton><IconButton label="Notifications" badge><Bell size={19} /></IconButton><span className="header__divider" /><div className="header__profile" aria-label="Current user"><span className="header__avatar">BDL</span><span className="user-details"><span className="user-name">BDL Department</span></span><IconButton label="Open profile menu" className="header__profile-menu"><ChevronDown size={17} /></IconButton></div></div>{isSearchOpen && <div className="command-modal" role="dialog" aria-modal="true" aria-label="Search"><button aria-label="Close search" className="command-modal__backdrop" onClick={() => setIsSearchOpen(false)} /><div className="command-modal__panel"><strong>Search command</strong><span>Search will connect to work orders when that endpoint is available.</span></div></div>}</header>;
}
