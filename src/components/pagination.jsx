'use client';

import { usePathname, useSearchParams } from "next/navigation";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationComponent({ itemCount, currentPage }) {

    const totalPages = Math.ceil(itemCount / 4);

    const pathName = usePathname();
    const sp = useSearchParams();

    const buildHref = (page) => {
        const params = new URLSearchParams(sp.toString());
        params.set("page", String(page));
        return `${pathName}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);
        if (currentPage > 3) pages.push("ellipsis");

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push("ellipsis");
        pages.push(totalPages);

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={buildHref(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {
                    getPageNumbers().map((page, idx) =>
                        page === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={buildHref(page)}
                                    isActive={page === currentPage}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )
                }

                <PaginationItem>
                    <PaginationNext
                        href={buildHref(currentPage + 1)}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}