import { Input } from "@/components/ui/input";

export default function loading() {
    return (
        <div className="flex flex-col gap-10 p-5">
            <h1 className="text-3xl text-brand">Quick Links</h1>
            <Input placeholder='search' />
            <div className="grid grid-cols-3 gap-2">
                {
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-8 animate-pulse"></div>
                    ))
                }
            </div>
        </div>
    )
}