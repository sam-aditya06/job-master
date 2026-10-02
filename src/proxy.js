import { NextResponse } from "next/server";
import { defaultLang, langs } from '@/lib/lang';

const PARAM_RENAMES = { for: "org", by: "recruiter" };

const REMOVED_PARAMS = ["sector"];

const GONE_PREFIXES = ["/orgs", "/recruitment-bodies"];

const MERGED_SUFFIXES = [
    { pattern: /^\/jobs\/([^/]+)\/responsibilities\/?$/, target: (m) => `/jobs/${m[1]}` },
];

export function proxy(request) {
    const { pathname } = request.nextUrl;

    const lang = langs.find(
        (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );

    const pathNoLang = lang ? pathname.slice(lang.length + 1) || "/" : pathname;

    if (GONE_PREFIXES.some((p) => pathNoLang === p || pathNoLang.startsWith(`${p}/`))) {
        return new NextResponse("Gone", { status: 410 });
    }

    const url = request.nextUrl.clone();
    const cleaned = new URLSearchParams();
    let dirty = false;

    for (const { pattern, target } of MERGED_SUFFIXES) {
        const m = pathNoLang.match(pattern);
        if (m) {
            const url = request.nextUrl.clone();
            url.pathname = `/${lang ?? defaultLang}${target(m)}`;
            return NextResponse.redirect(url, 301);
        }
    }

    for (const [key, value] of url.searchParams) {
        if (REMOVED_PARAMS.includes(key) || value === "[object Object]") {
            dirty = true; // drop it
            continue;
        }
        if (PARAM_RENAMES[key]) dirty = true;
        cleaned.append(PARAM_RENAMES[key] ?? key, value);
    }

    if (lang && !dirty) return NextResponse.next();

    if (!lang) {
        url.pathname = pathname === "/" ? `/${defaultLang}` : `/${defaultLang}${pathname}`;
    }
    url.search = cleaned.toString();
    return NextResponse.redirect(url, 301);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};