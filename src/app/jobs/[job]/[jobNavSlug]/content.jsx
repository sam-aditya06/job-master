export default function Content({ content }) {
    return (
        <div className="cms-content p-3" dangerouslySetInnerHTML={{ __html: content }} />
    )
}