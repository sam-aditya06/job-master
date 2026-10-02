"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useMessages } from "../messageProvider";

const words = ['Government', 'Banking', 'PSU', 'Defence'];

export default function HeroSection() {

  const { lang, messages } = useMessages();

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
    <section
      className="relative overflow-hidden h-screen -mt-[3.5rem] text-white"
    >
      <div className="hidden sm:block absolute inset-0 bg-cover" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}/hero-back.jpeg)` }} />
      <div className="sm:hidden absolute inset-0 bg-cover" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}/hero-back-mobile.jpeg)` }} />
      <div className="absolute inset-0 z-10 bg-black opacity-60" />
      <div className="relative flex flex-col justify-center items-center gap-10 mx-auto max-w-7xl h-full z-20">
        <div className="w-fit px-2">
          <h1 className="text-3xl md:text-5xl xl:text-6xl text-center font-bold leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {messages.home.hero.headingPartOne}<br />
            <span className="flex justify-center text-brand min-h-12 sm:min-h-23">{messages.home.hero.headingPartTwo}</span><br />
          </h1>
          <p className="text-lg text-white/60 text-center font-light">
            {messages.home.hero.intro}
          </p>
        </div>
        <Link className="rounded-sm bg-brand px-3 py-2" href={`/${lang}/recruitments`}>{messages.home.hero.ctaBtnTxt}</Link>
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