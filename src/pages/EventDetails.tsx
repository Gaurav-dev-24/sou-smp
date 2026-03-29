import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { type Event } from "../types/content";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ArrowLeft, Users, Info } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/components/PageLayout";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Enhanced theme detection - connect with existing navbar theme toggle
  useEffect(() => {
    // Initial theme check
    const checkTheme = () => {
      try {
        // Check for dark mode class on html element (how most navbar toggles work)
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      } catch (error) {
        console.error("Error checking theme:", error);
      }
    };
    
    // Do initial check
    checkTheme();
    
    // Set up observer to monitor theme changes from navbar
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    
    // Watch for class changes on html element
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class'] 
    });
    
    // Cleanup observer
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const eventRef = doc(db, "events", id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setEvent({
            id: eventDoc.id,
            title: eventData.title || "",
            date: eventData.date || "",
            description: eventData.description || "",
            learnMore: eventData.learnMore || "",
            location: eventData.location || "",
            imageUrl: eventData.image || "", // Changed from imageUrl to image
            ieeeCount: eventData.ieeeCount || 0,
            nonIeeeCount: eventData.nonIeeeCount || 0
          });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Function to format description text with bold headings
  const formatDescription = (text) => {
    if (!text) return null;
    
    // Split the text by lines
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check if the line contains a heading pattern (word followed by colon)
      const headingMatch = line.match(/^([A-Za-z\s]+):(.*)$/);
      
      if (headingMatch) {
        // If it's a heading, render it with bold heading and normal text
        return (
          <p key={index} className="mb-2">
            <strong className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              {headingMatch[1]}:
            </strong>
            {headingMatch[2]}
          </p>
        );
      } else {
        // Regular paragraph
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  if (loading) {
    return (
      <PageLayout showFooter>
        <div className="max-w-4xl mx-auto pt-12 px-4 pb-16">
          <Skeleton className="h-10 w-24 mb-6" />
          <div className="flex flex-col items-center mb-12">
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="w-full max-w-md h-96 rounded-2xl" />
          </div>
          <div className="flex flex-col items-center mb-10">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout showFooter>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <div className="text-6xl font-black opacity-10">404</div>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <Button asChild onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}>
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Safety
            </span>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Back Button */}
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#00629B] mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </Link>

          {/* Header Section - Systematic & Centered */}
          <header className="mb-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            {/* Poster Tag */}
            <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
              Event Poster
            </span>

            {/* Poster Image */}
            <div className="flex justify-center mb-10 w-full">
              <div className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.03] border border-border/40 bg-card/10 p-2">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-auto object-contain rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-[1.15] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 max-w-4xl mx-auto">
              {event.title}
            </h1>

            {/* Meta Row (Centered) */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 border-y border-border/40 w-full mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-5 w-5 text-[#00629B]" />
                <span className="font-semibold">{event.date}</span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border/40 pl-8 h-8">
                  <MapPinIcon className="h-5 w-5 text-[#00629B]" />
                  <span className="font-semibold">{event.location}</span>
                </div>
              )}
            </div>
          </header>

          {/* Content Block - Organized & Systematic */}
          <div className="max-w-4xl mx-auto space-y-12 mb-16 animate-in fade-in duration-1000 delay-300 fill-mode-both">
            {/* Description Card */}
            <section className="relative bg-card/30 border border-border/40 rounded-3xl p-8 md:p-12 shadow-sm backdrop-blur-[2px] text-left">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-12 bottom-12 w-1 bg-gradient-to-b from-transparent via-[#00629B]/20 to-transparent"></div>
              
              <h2 className="text-2xl font-bold mb-8 flex items-center justify-start gap-3">
                <Info className="h-6 w-6 text-[#00629B]" />
                Event Description
              </h2>
              
              <div className="prose dark:prose-invert prose-blue max-w-none text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {formatDescription(event.description)}
              </div>
            </section>

            {/* Learn More Card (if available) */}
            {event.learnMore && (
              <section className="relative bg-[#00629B]/5 border border-[#00629B]/20 rounded-3xl p-8 md:p-12 shadow-sm text-left">
                <h2 className="text-2xl font-bold mb-6 text-[#00629B]">
                  Key Insights
                </h2>
                <div className="prose dark:prose-invert prose-blue max-w-none text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {formatDescription(event.learnMore)}
                </div>
              </section>
            )}

            {/* Attendance Summary Bar (if available) */}
            {(event.ieeeCount > 0 || event.nonIeeeCount > 0) && (
              <section className="bg-muted/30 border border-border/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-start gap-8 sm:gap-16">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-[#00629B]" />
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Attendance</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-start gap-8">
                  {event.ieeeCount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-black text-[#00629B]">{event.ieeeCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">IEEE Members</p>
                    </div>
                  )}
                  {event.nonIeeeCount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{event.nonIeeeCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Non-IEEE</p>
                    </div>
                  )}
                  {(event.ieeeCount > 0 && event.nonIeeeCount > 0) && (
                    <div className="text-center pl-8 border-l border-border/40">
                      <p className="text-2xl font-black text-primary">{event.ieeeCount + event.nonIeeeCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Total Impact</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default EventDetails;