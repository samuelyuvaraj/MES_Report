import { Search } from "lucide-react";
import "./ui.css";
interface SearchCommandProps { onOpen: () => void; }
export function SearchCommand({ onOpen }: SearchCommandProps) { return <button className="search-command" onClick={onOpen} aria-label="Open search command"><Search size={18} /><span className="search-command__placeholder">Search work orders, material, or anything...</span><kbd>Ctrl K</kbd></button>; }
