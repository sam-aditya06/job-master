export default function Overview({ content }) {
    return (
        <>
            {
                content ?
                    <div className="cms-content p-3" dangerouslySetInnerHTML={{ __html: content }} /> :
                    <div className="flex justify-center items-center h-full text-3xl text-muted-foreground">
                        Information is not available at the moment
                    </div>
            }
        </>
    )
}