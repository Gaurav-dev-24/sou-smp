import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { type Award } from "../types/content";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrophyIcon, ArrowLeft } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const AwardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [award, setAward] = useState<Award | null>(null);
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
    const fetchAward = async () => {
      if (!id) return;

      try {
        const awardRef = doc(db, "awards", id);
        const awardDoc = await getDoc(awardRef);

        if (awardDoc.exists()) {
          const awardData = awardDoc.data();
          setAward({
            id: awardDoc.id,
            title: awardData.title || awardData.name || "",
            date: awardData.date || awardData.year || "",
            description: awardData.description || "",
            recipient: awardData.recipient || awardData.studentName || "",
            imageUrl: awardData.imageUrl || awardData.image || "",
            pdfUrl: awardData.pdfUrl || "",
            category: awardData.category || awardData.type || "Other",
            winners: awardData.winners || "",
            location: awardData.location || ""
          });
        }
      } catch (error) {
        console.error("Error fetching award:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAward();
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
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <div className="max-w-4xl mx-auto pt-8 px-4 pb-16">
          <Skeleton className="h-10 w-24 mb-6" />
          <div className="w-full mb-8">
            <Skeleton className="h-6 w-32 mb-2" />
            <div className="flex justify-center">
              <Skeleton className="w-full max-w-md h-64 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4 border-none" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!award) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-black'}`}>
          Award Not Found
        </h1>
        <Button asChild variant={isDark ? "outline" : "default"} onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}>
          <span>Back</span>
        </Button>
      </div>
    );
  }

  if (award.pdfUrl) {
    return (
      <div className="fixed inset-0 w-full h-full z-[9999] bg-white">
        <iframe
          src={`${award.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title={award.title}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <div className="max-w-4xl mx-auto pt-8 px-4 pb-16">
        <Button 
          variant={isDark ? "ghost" : "outline"} 
          className="mb-6"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
        >
          <span className={`flex items-center gap-2 ${isDark ? 'text-gray-200 hover:text-white' : 'text-black'}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </Button>

        {/* Image - Award Certificate/Trophy */}
        <div className="w-full mb-8">
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-black'}`}>
            Award Image
          </h2>
          <div className="flex justify-center">
            <div className={`relative w-full max-w-md overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02] ${
              isDark ? 'border border-gray-700' : 'border border-blue-200'
            }`}>
              {award.imageUrl ? (
                <>
                  <img
                    src={award.imageUrl}
                    alt={award.title}
                    className={`w-full h-auto object-contain ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDark ? 'from-gray-900/50' : 'from-blue-900/20'
                  } to-transparent pointer-events-none`}></div>
                </>
              ) : (
                <div className={`w-full h-64 flex items-center justify-center ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <TrophyIcon className={`h-20 w-20 ${
                    isDark ? 'text-gray-600' : 'text-blue-200'
                  }`} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
          isDark ? 'text-blue-300' : 'text-blue-900'
        }`}>
          {award.title}
        </h1>

        {/* Date and Recipient */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-black'}`}>
            <CalendarIcon className="h-5 w-5" />
            <span>{award.date}</span>
          </div>

          {award.recipient && (
            <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-black'}`}>
              <TrophyIcon className="h-5 w-5" />
              <span>Recipient: {award.recipient}</span>
            </div>
          )}
        </div>
       
        {/* Description */}
        <div className={`prose max-w-none ${isDark ? 'text-gray-300' : 'text-black'}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-black'}`}>
            Award Description
          </h2>
          <div className={`text-lg text-justify leading-relaxed ${isDark ? 'text-gray-300' : ''}`}>
            {formatDescription(award.description)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardDetails;