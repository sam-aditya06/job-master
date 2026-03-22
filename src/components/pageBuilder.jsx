import { formatText } from "@/lib/utils";
import Link from "next/link";

export default function PageBuilder({ data }) {
    return (
        <>
            {
                data.map((el, i) => {
                    const { type, value } = el;
                    if (type === 'h2')
                        return <h2 key={i} className="text-2xl mt-8 text-brand">{value}</h2>
                    else if (type === 'h3')
                        return <h3 key={i} className="text-xl mt-8">{value}</h3>
                    else if (type === 'p')
                        return <p key={i} className="mt-6 text-justify dark:text-white/80 text-base/7" dangerouslySetInnerHTML={{ __html: formatText(value) }} />
                    else if (type === 'ol')
                        return <ol key={i} className="mt-6 pl-5 !list-decimal">
                            {
                                value.map(item => (
                                    <li key={item}>{item}</li>
                                ))
                            }
                        </ol>
                    else if (type === 'link')
                        return <Link target="_blank" key={i} href={value.link} className="border rounded-md bg-brand dark:bg-brand/80 mt-4 mx-auto px-3 py-2 w-fit text-white">{value.text}</Link>
                    else if (type === 'table')
                        return (
                            <div key={i} className="mt-4 w-full overflow-x-auto">
                                <table className="table-auto border border-collapse mx-auto w-full text-sm">
                                    <thead>
                                        {
                                            Array.from({ length: Math.max(...value.filter(item => item.rowIndex === 0).map(item => item.rowSpan)) }).map((_, j) => {
                                                return (
                                                    <tr key={j} className="border h-8">
                                                        {
                                                            value.filter(item => item.rowIndex === j).map((item, k) => {
                                                                return <th className="border h-8" key={k} rowSpan={item.rowSpan} colSpan={item.colSpan}>{item.cellValue}</th>
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            })

                                        }
                                    </thead>
                                    <tbody>
                                        {
                                            Array.from({ length: Math.max(...value.map(item => item.rowIndex)) + 1 }).map((_, i) => {
                                                if (i <= Math.max(...value.filter(item => item.rowIndex === 0).map(item => item.rowSpan)) - 1)
                                                    return;
                                                return (
                                                    <tr className="border h-8" key={i}>
                                                        {
                                                            value.filter(item => item.rowIndex === i).map((item, idx) => {
                                                                const colExists = value.find(el => el.rowIndex === i && el.colIndex === idx);
                                                                if (colExists)
                                                                    return <td className="border p-1 h-8 dark:text-white/80" key={idx} rowSpan={item.rowSpan} colSpan={item.colSpan} dangerouslySetInnerHTML={{ __html: formatText(item.cellValue) }} />
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                })
            }
        </>
    )
}