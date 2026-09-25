"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ORG } from "@/lib/constants/brand";

// 슬라이드 데이터 — 사진 파일은 /public/images/hero/ 에 위치
// objectPosition: 얼굴이 잘리지 않도록 사진별로 초점 위치 지정
const SLIDES = [
  {
    src: "/images/hero/hero-1.jpg",
    alt: "건물 앞에 모인 아이들",
    objectPosition: "center 25%",   // 학교 건물 장면 — 상단에 건물, 중간에 얼굴
    title: ORG.nameKo,
    desc: ORG.sloganKo,
  },
  {
    src: "/images/hero/hero-2.jpg",
    alt: "현장 활동 지역 풍경",
    objectPosition: "center center", // 풍경 사진 — 중앙 정렬
    title: "현장에서 시작합니다",
    desc: "직접 발로 뛰며 지역의 필요를 함께 찾아갑니다",
  },
  {
    src: "/images/hero/hero-3.jpg",
    alt: "야외에 모여 있는 많은 아이들",
    objectPosition: "center 40%",   // 대규모 야외 단체 사진 — 얼굴 살짝 아래 기준
    title: "배움이 가능성을 열다",
    desc: "아이 한 명의 성장이 공동체 전체를 밝게 합니다",
  },
] as const;

export function Hero() {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);
  const next = useCallback(() => setIdx((i) => (i + 1) % SLIDES.length), []);

  // 5초 자동 슬라이드
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    /*
      - -mt-[84px]: 헤더(84px) 뒤로 당겨 사진이 헤더 아래까지 가득 채움
      - height: 100dvh: 뷰포트 전체 높이 (모바일 주소창 포함)
      - object-cover + objectPosition: 화면 끝까지 채우되 얼굴 잘림 최소화
    */
    <section
      className="relative w-full overflow-hidden -mt-[84px]"
      style={{ height: "100dvh" }}
    >
      {/* ── 슬라이드 이미지 ── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            style={{ objectFit: "cover", objectPosition: slide.objectPosition }}
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── 상단 그라데이션: 헤더 메뉴 가독성 확보 ── */}
      <div className="absolute inset-x-0 top-0 h-[160px] bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* ── 하단 그라데이션: 텍스트·CTA 가독성 확보 ── */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/75 via-black/40 to-transparent pointer-events-none z-10" />

      {/* ── 텍스트 / CTA — 하단 배치, 얼굴 영역(상단) 비침 ── */}
      <div className="absolute inset-x-0 bottom-0 section-wrap pb-14 md:pb-20 text-cream z-20">
        <p className="text-[12px] md:text-[13px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
          {ORG.nameEn}
        </p>

        {/* 슬라이드별 제목·설명 — 페이드 전환 */}
        <div className="relative min-h-[120px] md:min-h-[130px]">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`transition-opacity duration-500 ${
                i === idx ? "opacity-100" : "opacity-0 absolute inset-0"
              }`}
            >
              <h1 className="font-display text-[28px] md:text-[44px] leading-[1.2] mb-3 max-w-2xl">
                {slide.title}
              </h1>
              <p className="text-[15px] md:text-[18px] text-cream/90 max-w-lg">{slide.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/what-we-do"
            className="inline-flex items-center rounded-full bg-gold px-6 py-2.5 text-[14px] md:text-[15px] font-semibold text-navy transition-colors hover:bg-gold-dark"
          >
            우리의 활동
          </Link>
          <Link
            href="/membership"
            className="inline-flex items-center rounded-full border-2 border-cream/60 px-6 py-2.5 text-[14px] md:text-[15px] font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
          >
            함께하기
          </Link>
        </div>
      </div>

      {/* ── 이전 / 다음 버튼 ── */}
      <button
        onClick={prev}
        aria-label="이전 슬라이드"
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-cream hover:bg-black/55 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 4 7 10 13 16" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="다음 슬라이드"
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-cream hover:bg-black/55 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 4 13 10 7 16" />
        </svg>
      </button>

      {/* ── 슬라이드 도트 ── */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`슬라이드 ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-7 bg-gold" : "w-2.5 bg-cream/45 hover:bg-cream/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
