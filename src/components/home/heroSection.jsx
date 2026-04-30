"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const words = ['Government', 'Banking', 'PSU', 'Defence'];

export default function HeroSection() {

  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bgUrl, setBgUrl] = useState('');

  const currentWord = words[wordIndex % words.length];
  const visibleWord = currentWord.slice(0, charIndex);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setBgUrl(`${process.env.NEXT_PUBLIC_CDN_URL}/hero-back-mobile.jpeg`); // mobile / small screens
      } else {
        setBgUrl(`${process.env.NEXT_PUBLIC_CDN_URL}/hero-back.jpeg`); // tablet and above
      }
    };

    // run once on mount
    handleResize();

    // listen for resize
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      className="relative overflow-hidden bg-cover h-screen -mt-[3.5rem] text-white"
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="absolute inset-0 z-10 bg-black opacity-60 dark:opacity-80" />
      <div className="relative flex flex-col justify-center items-center gap-10 mx-auto max-w-7xl h-full z-20">
        <div className="w-fit lg:w-[41rem] px-2">
          <h1 className="text-4xl md:text-7xl text-center font-bold leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Your Roadmap for<br /> a Career in<br />
            <span className="flex justify-center text-brand min-h-12 sm:min-h-23">{visibleWord}</span>
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