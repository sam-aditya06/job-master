export default function Content({ content }) {
    return (
        <div className="cms-content pt-5 sm:pr-3 xl:pt-0" dangerouslySetInnerHTML={{ __html: content }} />
    )
}