'use client';

export default function Recruitment({ content }) {
    return (
        <div className="cms-content p-5 h-full overflow-y-auto" dangerouslySetInnerHTML={{ __html: content }} />
    )
}