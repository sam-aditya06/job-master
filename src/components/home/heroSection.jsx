"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { TrendingUp } from "lucide-react";

import { slugify } from "@/lib/utils";

const trendingSearches = ['IBPS PO', 'SBI PO', 'RRB NTPC']

const words = ['Government', 'Banking', 'PSU', 'Defence'];

export default function HeroSection() {

  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = words[wordIndex % words.length];
  const visibleWord = currentWord.slice(0, charIndex);

  useEffect(() => {
    let delay = isDeleting ? 100 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2000;
    }

    const id = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentWord.length) setCharIndex(c => c + 1);
        else setIsDeleting(true);
      } else {
        if (charIndex > 0) setCharIndex(c => c - 1);
        else {
          setIsDeleting(false);
          setWordIndex(w => w + 1);
        }
      }
    }, delay);

    return () => clearTimeout(id);
  }, [charIndex, isDeleting, currentWord]);


  return (
    <section className="relative overflow-hidden bg-cover bg-[url(https://images.pexels.com/photos/9841343/pexels-photo-9841343.jpeg)] sm:bg-[url(https://images.pexels.com/photos/9832700/pexels-photo-9832700.jpeg)] h-screen -mt-[3.5rem] text-white">
      <div className="absolute inset-0 z-10 bg-black opacity-60 dark:opacity-80" />
      <div className="relative flex flex-col justify-center items-center gap-10 mx-auto max-w-7xl h-full z-20">
        <div className="w-fit lg:w-[41rem] px-2">
          <h1 className="text-4xl md:text-7xl text-center font-bold leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Your Roadmap for<br /> a Career in<br />
            <span className="flex justify-center text-brand min-h-22">{visibleWord}</span>
          </h1>
          <p className="text-lg text-white/60 text-center font-light">
            From exam notifications to salary breakdowns — everything you need to crack public sector jobs in India.
          </p>
        </div>
        <Link className="rounded-sm bg-brand px-3 py-2" href='/recruitments?status=ongoing'>Explore Recruitments</Link>
        {/* <div className="flex flex-wrap items-center gap-2 mb-14">
          <span className="flex items-center gap-1 text-white/40 text-sm">
            <TrendingUp className="w-3.5 h-3.5" /> Trending:
          </span>
          {trendingSearches.map((term) => (
            <Link
              key={term}
              href={`/recruitments/${slugify(term)}`}
              className="text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full transition-colors"
            >
              {term}
            </Link>
          ))}
        </div> */}
      </div>
    </section>
  );
}