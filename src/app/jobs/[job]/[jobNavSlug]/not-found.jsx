import { XCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
                <XCircle className="w-12 h-12 stroke-white fill-red-700" />
                <h1 className="text-2xl font-semibold tracking-tight">
                    Page Not Found
                </h1>
            </div>
            <p className="text-muted-foreground text-sm">
                The page you're looking for doesn't exist.
            </p>
        </div>
    )
}