import { useEffect, useRef, useState } from "react";
import { FactItem } from "@/types";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FACTS: FactItem[] = [
  { value: 190, label: "Members", suffix: "+" },
  { value: 300, label: "Events", suffix: "+" },
  { value: 25, label: "Awards", suffix: "+" },
  { value: 5700, label: "Participations", suffix: "+" },
];

function CountUpNumber({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            let startTime: number;
            const animateCount = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              setCount(Math.floor(end * eased));
              if (progress < 1) requestAnimationFrame(animateCount);
            };
            requestAnimationFrame(animateCount);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => { if (countRef.current) observer.unobserve(countRef.current); };
  }, [end, duration, hasAnimated]);

  return (
    <div ref={countRef} className="font-black text-5xl md:text-6xl text-primary tabular-nums relative">
      <span className="inline-block transition-all duration-300">
        {prefix}{count.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

export default function CountUpSection() {
  const sectionRef = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <div ref={sectionRef} className="py-4 bg-primary/5 w-full overflow-hidden relative">
      {/* Fixed background text that doesn't move */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span
          className="text-[18vw] font-black text-primary/5 dark:text-primary/5 whitespace-nowrap leading-none"
          style={{ transform: 'translateZ(0)' }}
        >
          IEEE SOU
        </span>
      </div>

      <div className="section-container w-full relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="reveal flip-up text-3xl md:text-4xl font-bold mb-4">
            Some Facts About Us
          </h2>
          <div className="heading-line reveal mx-auto" style={{ maxWidth: 96 }} />
        </div>

        {/* Stat cards — pop in with bounce + heavy stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FACTS.map((fact, index) => (
            <div
              key={index}
              className={`reveal pop delay-${index + 1} text-center p-6 glass rounded-2xl shadow-lg border border-primary/10 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}
              style={{
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none" />
              <div className="relative z-10">
                <CountUpNumber
                  end={fact.value}
                  prefix={fact.prefix}
                  suffix={fact.suffix}
                />
                <p className="text-base mt-3 font-medium text-muted-foreground uppercase tracking-widest text-xs">
                  {fact.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
