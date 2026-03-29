import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";

interface FirestoreEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
  speakers: string;
  isUpcoming?: boolean;
}

export default function Events() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get("year") ?? "all"
  );
  const [events, setEvents] = useState<FirestoreEvent[]>([]);

  // Sync selectedYear when the URL ?year param changes (e.g. navbar click)
  useEffect(() => {
    const yearParam = searchParams.get("year");
    setSelectedYear(yearParam ?? "all");
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsRef = collection(db, "events");
      const snapshot = await getDocs(eventsRef);

      const data: FirestoreEvent[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreEvent[];

      // Sort by event.date descending (latest first)
      const sortedByDate = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEvents(sortedByDate);
    };

    fetchEvents();
  }, []);

  // Derive unique years from events (descending)
  const availableYears = Array.from(
    new Set(
      events
        .map((e) => {
          const parsed = new Date(e.date);
          return isNaN(parsed.getTime()) ? null : String(parsed.getFullYear());
        })
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => Number(b) - Number(a));

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear =
      selectedYear === "all" ||
      String(new Date(event.date).getFullYear()) === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <PageLayout showFooter>
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {selectedYear === "all" ? "Events" : `${selectedYear} Events`}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our upcoming and past events, workshops, and conferences designed to enhance your technical knowledge and professional network.
            </p>
          </div>

          {/* Year filter pills */}
          {availableYears.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <button
                onClick={() => setSelectedYear("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${selectedYear === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
              >
                All
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${selectedYear === year
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Active year heading */}
          <div className="flex items-center gap-3 mb-8">
            <CalendarDays className="h-6 w-6 text-primary flex-shrink-0" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {selectedYear === "all" ? "All Events" : `${selectedYear} Events`}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold">{filteredEvents.length}</span>{" "}
              events
              {selectedYear !== "all" && (
                <span className="ml-1 text-primary font-medium">in {selectedYear}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="glass flex flex-col rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="image-container bg-muted/30">
                  <img loading="lazy"
                    src={event.image}
                    alt={event.name}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-5 card-content">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {event.date} • {event.time}
                  </p>
                  <p className="text-sm mb-4 line-clamp-2">{event.description}</p>
                  {event.speakers && event.speakers.trim() !== "" && (
                    <p className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Speakers:</span> {event.speakers}
                    </p>
                  )}
                  <Button size="sm" asChild className="action-btn">
                    <Link to={`/eventdetails/${event.id}`}>Learn More</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
