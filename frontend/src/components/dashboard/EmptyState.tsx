import { Inbox } from "lucide-react";
import "./EmptyState.css";

interface EmptyStateProps { title: string; description: string; }

export function EmptyState({ title, description }: EmptyStateProps) {
    return <div className="empty-state"><Inbox size={28} /><h2>{title}</h2><p>{description}</p></div>;
}
