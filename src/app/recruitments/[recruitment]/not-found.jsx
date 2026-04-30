import Link from "next/link"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="max-w-md w-full text-center shadow-lg border">
        <CardContent className="p-8 flex flex-col items-center gap-4">
          
          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Recruitment Not Found
          </h1>

          <p className="text-muted-foreground text-sm">
            The recruitment you're looking for either doesn't exist or may not have been added yet.
          </p>

          <div className="flex gap-3 mt-4">
            <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
              <Link href="/recruitments">Browse Recruitments</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}