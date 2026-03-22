'use client';

export default function Recruitment({ recruitmentDetails }) {
    const { content } = recruitmentDetails;
    return (
        <div className="cms-content p-3" dangerouslySetInnerHTML={{ __html: content }} />
    )
}