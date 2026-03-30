import { useState, useEffect } from "react";
import { Search, Linkedin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { TypingAnimation } from "@/components/TypingAnimation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

interface Member {
  id: string;
  name: string;
  linkedin: string;
  image: string;
  education: string;
  designation: string;
  createdAt: any;
  type: string;
}

// Using a consistent hover effect for all members
const HOVER_EFFECT = "hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] transition-transform";

export default function TeamAdvisory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [advisoryMembers, setAdvisoryMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch advisory members from Firestore
  useEffect(() => {
    const fetchAdvisoryMembers = async () => {
      setLoading(true);
      try {
        const membersRef = collection(db, "members");
        const q = query(
          membersRef,
          where("type", "==", "advisory")
        );

        const snapshot = await getDocs(q);
        const data: Member[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Member[];

        // Sort by display order client-side to bypass Firebase composite index requirements
        data.sort((a, b) => ((a as any).displayOrder ?? 999) - ((b as any).displayOrder ?? 999));

        setAdvisoryMembers(data);
      } catch (error) {
        console.error("Error fetching advisory members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisoryMembers();
  }, []);

  // Filter members based on search term
  const filtered = advisoryMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Members are already sorted by displayOrder from the Firestore query
  // No additional sort needed - use filtered directly.

  return (
    <PageLayout showFooter>
      <main className="pb-16 animate-fade-in bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">Student Advisory Board</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-muted-foreground-dark">
              <TypingAnimation text={"Meet the esteemed advisory board of IEEE SOU Student Branch."} />
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search advisory board..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 glass rounded-xl shadow-md p-6 flex flex-col items-center text-center h-[340px]">
                  <Skeleton className="w-32 h-32 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl border border-dashed border-border/50">
              <p className="text-xl text-muted-foreground font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2">No advisory board members are listed at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {filtered.map(member => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-900 glass rounded-xl overflow-hidden shadow-md hover:shadow-lg 
                             dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.7)] hover:scale-[1.02]
                             transition-all duration-300 p-6 flex flex-col items-center text-center h-full cursor-pointer relative"
                >
                  <img loading="lazy"
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-lg object-cover mb-4 border-2 border-muted dark:border-gray-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                  />
                  <div className="flex flex-col items-center justify-center mb-2 min-h-[56px] w-full px-2">
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-white line-clamp-2">
                      {member.name}
                    </h3>
                  </div>
                  <div className="flex-grow flex flex-col items-center justify-start w-full gap-3 mt-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                      {member.designation}
                    </p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                    {member.education && `: ${member.education}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
