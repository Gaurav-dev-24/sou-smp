import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { journeyItems, type JourneyItem } from "@/data/journeyData";
import { collection, getDocs, doc, getDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import App from "../../App.tsx";
import "../../App.css";

// Gradients removed to match main site theme

export default function JourneyDetails() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<JourneyItem | null | undefined>(undefined);
  const [itemIndex, setItemIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [allJourneyItems, setAllJourneyItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "journey")),
      (snapshot) => {
        const journeyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as JourneyItem[];
        
        // Sort by order asc, or year desc
        const sortedJourney = journeyData.sort((a: any, b: any) => {
          if (a.order !== undefined && b.order !== undefined) {
             return a.order - b.order;
          }
          const yearA = parseInt(a.year || "0");
          const yearB = parseInt(b.year || "0");
          return yearB - yearA;
        });
        
        setAllJourneyItems(sortedJourney);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching journey data:", error);
        // Fallback to static data if Firebase fails
        setAllJourneyItems(journeyItems);
        setLoading(false);
      }
    );

    // Return cleanup function to unsubscribe from listener
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    console.log('JourneyDetails - id:', id);
    console.log('JourneyDetails - allJourneyItems:', allJourneyItems);
    
    const found = allJourneyItems.find((j) => j.id === id);
    const idx = allJourneyItems.findIndex((j) => j.id === id);
    console.log('JourneyDetails - found:', found);
    console.log('JourneyDetails - idx:', idx);
    
    setItem(found ?? null);
    setItemIndex(idx >= 0 ? idx : 0);
    setSlideIndex(0);
    setFade(true);
    setVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, [id, allJourneyItems, loading]);

  const additionalImages = (item as any)?.images && (item as any).images.length > 1
    ? (item as any).images.slice(1).map((imgUrl: string) => ({
        imageUrl: imgUrl,
        caption: item?.title,
        description: item?.description,
      }))
    : [];

  const slides = item
    ? [
        { imageUrl: item.imageUrl, caption: item.title, description: item.description },
        ...additionalImages,
        ...(item.gallery ?? []).map((g: any) => ({
          imageUrl: g.imageUrl,
          caption: g.caption,
          description: g.description,
        })),
      ]
    : [];

  const goTo = (getNext: (prev: number) => number) => {
    setSlideIndex((prev) => getNext(prev));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    goTo((prev) => (prev - 1 + slides.length) % slides.length);
  };
  
  const handleNext = () => {
    goTo((prev) => (prev + 1) % slides.length);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading journey details...</span>
        </div>
      </div>
    );
  }

  // bg removed
  if (item === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-foreground px-4 bg-background">
        <div className="text-5xl font-black opacity-20 text-muted-foreground">404</div>
        <h1 className="text-xl font-bold">Journey Chapter Not Found</h1>
        <Link to="/about/ieee-sou-sb-journey-loop" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition-all hover:scale-105">
          <ArrowLeft className="w-4 h-4" /> Back to Our Journey
        </Link>
      </div>
    );
  }

  const currentSlide = slides[slideIndex];

  return (
    <div
      className="min-h-screen w-full text-foreground bg-background flex flex-col relative"
    >
      {/* Dynamic Full-Page Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {currentSlide?.imageUrl ? (
          <div className="absolute inset-0 z-0 transition-opacity duration-1000 bg-background">
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-25 dark:opacity-15 scale-110 blur-[80px] transition-all duration-1000"
              style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 dark:opacity-10">
            <img loading="lazy" src="/images/logo.png" alt="bg-logo" className="w-[60%] max-w-[500px] min-w-[200px] scale-[2]" />
          </div>
        )}
      </div>

      <div
        className={`relative z-10 flex flex-col flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-4 md:py-6 transition-all duration-600 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* ── TOP: breadcrumb + badge + title ── */}
        <div className="flex-shrink-0 mb-3 bg-card border rounded-2xl p-4 md:p-6 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
            <Link to="/about/ieee-sou-sb-journey-loop" className="hover:text-primary transition-colors flex items-center gap-1 group font-medium">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Our Journey
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-foreground font-semibold">{item.title}</span>
          </div>

          {/* Badge row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm">
              <Calendar className="w-3 h-3" />
              {item.year}
            </span>
            <span className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase">
              Chapter {itemIndex + 1} / {allJourneyItems.length}
            </span>
          </div>

          {/* Title + subtitle */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-card-foreground">
            {item.title}
          </h1>
        </div>

        {/* ── MIDDLE: image slideshow & description ── */}
        <div className="flex-col gap-4">
          {/* Slideshow container */}
          <div className="relative rounded-2xl overflow-hidden border shadow-lg w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] bg-card mb-4 flex-shrink-0">
            
            <div 
              className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={`${slide.imageUrl}-${index}`}
                  className="relative w-full h-full flex-shrink-0"
                >
                  {/* Ambient Blurred Background to fill empty space */}
                  <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-2xl scale-125"
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                  />
                  
                  <img loading="lazy"
                    src={slide.imageUrl}
                    alt={slide.caption}
                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Year watermark on slide 0 */}
                  {index === 0 && (
                    <div className="absolute bottom-12 right-6 text-6xl md:text-8xl font-black text-white/15 select-none pointer-events-none leading-none tracking-tighter mix-blend-overlay z-30">
                      {item.year}
                    </div>
                  )}

                  {/* Caption */}
                  <div className="absolute bottom-8 left-0 right-0 px-6 z-30 pointer-events-none">
                    <p className="text-white font-bold text-lg md:text-xl leading-snug drop-shadow-md max-w-2xl">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide counter */}
            <div className="absolute top-4 left-4 z-40">
                <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white text-[10px] md:text-xs font-bold tracking-widest backdrop-blur-md shadow-sm">
                  {slideIndex + 1} / {slides.length}
                </span>
              </div>

            {/* Prev / Next arrows */}
            {slides.length > 1 && (
              <>
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg z-10" aria-label="Previous">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg z-10" aria-label="Next">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(() => i)}
                    className={`rounded-full transition-all duration-300 shadow-sm ${i === slideIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Description card ── */}
          {currentSlide.description && (
            <div
              className="flex-shrink-0 bg-card border rounded-2xl p-6 md:p-8 shadow-sm transition-opacity duration-300 ease-in-out mt-2"
            >
              <p className="text-foreground text-base md:text-lg font-medium leading-relaxed whitespace-pre-line">
                {currentSlide.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
