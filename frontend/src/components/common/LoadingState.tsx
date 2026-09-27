import "./State.css";

interface LoadingStateProps { label?: string; }

export function LoadingState({ label = "Loading data..." }: LoadingStateProps) {
    return <div className="state-message" role="status"><span className="state-message__spinner" /><span>{label}</span></div>;
}
