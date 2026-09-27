import "./SectionHeader.css";

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
    return (
        <div className="section-header">
            {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </div>
    );
}
