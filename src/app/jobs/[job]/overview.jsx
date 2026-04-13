export default function Overview({ content }) {
    return (
        <>
            {
                content ?
                    <div className="cms-content pt-5 sm:pr-3 xl:pt-0" dangerouslySetInnerHTML={{ __html: content }} /> :
                    <div className="flex justify-center items-center h-full text-3xl text-muted-foreground">
                        Information is not available at the moment
                    </div>
            }
        </>
    )
}