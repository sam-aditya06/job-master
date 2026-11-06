import { NextResponse } from "next/server";
import { defaultLang, langs } from '@/lib/lang';

const PARAM_RENAMES = { for: "org", by: "recruiter" };

const REMOVED_PARAMS = ["sector"];

const MERGED_SUFFIXES = [
    { pattern: /^\/jobs\/([^/]+)\/responsibilities\/?$/, target: (m) => `/jobs/${m[1]}` },
];

export function proxy(request) {
    const { pathname } = request.nextUrl;

    const pathArr = pathname.substring(1).split('/');

    const lang = langs.find(
        (l) => l === pathArr[0]
    );

    const pathNoLang = lang ? pathname.slice(lang.length + 1) || "/" : pathname;

    if (pathArr.includes("orgs") || pathArr.includes("recruitment-bodies")) {
        return new NextResponse("Gone", { status: 410 });
    }

    
    if ((pathArr[1] === 'recruitments' || pathArr[1] === 'jobs') && pathArr.length === 4) {
        const newPathName = pathArr.slice(0, 3).join('/') + "#" + pathArr[3];
        const newUrl = new URL(newPathName, request.nextUrl.origin);
        return NextResponse.redirect(newUrl, 301);
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