import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import MultiImageInput from "./MultiImageInput";

interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  award?: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const AwardModal: React.FC<AwardModalProps> = ({ isOpen, onClose, award, setSuccess, setError }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [awardType, setAwardType] = useState<string>("branch");
  const [newsletterType, setNewsletterType] = useState<string>("general");
  const [awardTitle, setAwardTitle] = useState<string>("");
  const [images, setImages] = useState<string[]>([""]);  // multi-image
  const [awardDescription, setAwardDescription] = useState<string>("");
  const [awardYear, setAwardYear] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Initialize form with award data if editing
  useEffect(() => {
    if (award) {
      setAwardType(award.type || "branch");
      setNewsletterType(award.newsletterType || "general");
      setAwardTitle(award.title || "");
      if (award.images?.length > 0) {
        setImages(award.images);
      } else if (award.image) {
        setImages([award.image]);
      } else {
        setImages([""]);
      }
      setAwardDescription(award.description || "");
      setAwardYear(award.year || "");
      setStudentName(award.studentName || "");
      setPdfUrl(award.pdfUrl || "");
    } else {
      resetAwardForm();
    }
  }, [award]);

  // Reset form states
  const resetAwardForm = () => {
    setAwardType("branch");
    setNewsletterType("general");
    setAwardTitle("");
    setImages([""]);
    setAwardDescription("");
    setAwardYear("");
    setStudentName("");
    setPdfUrl("");
  };

  // Handle form submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanImages = images.map(i => i.trim()).filter(i => i !== "");
      const awardData: any = {
        type: awardType,
        title: awardTitle,
        image: cleanImages[0] || "",
        images: cleanImages,
        description: awardDescription,
        year: awardYear,
        pdfUrl: pdfUrl,
        ...(award ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      };

      if (awardType === "student") {
        awardData.studentName = studentName;
      }
      if (awardType === "newsletter") {
        awardData.newsletterType = newsletterType;
      }

      if (award?.id) {
        // Update existing document
        await updateDoc(doc(db, "awards", award.id), awardData);
        setSuccess("Award updated successfully!");
      } else {
        // Add new document
        await addDoc(collection(db, "awards"), awardData);
        setSuccess("Award added successfully!");
      }

      resetAwardForm();
      onClose();
    } catch (err: any) {
      setError(`Error ${award ? 'updating' : 'adding'} award: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{award ? 'Edit' : 'Add New'} Award</h3>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Award Type</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                value={awardType}
                onChange={(e) => setAwardType(e.target.value)}
                required
              >
                <option value="branch">Branch Achievement</option>
                <option value="student">Student Achievement</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Award Title</label>
              <input
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Best Department Award"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                required
              />
            </div>

            {awardType === "student" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Student Name</label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jane Smith"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required={awardType === "student"}
                />
              </div>
            )}
            {awardType === "newsletter" && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Newsletter Type</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                    value={newsletterType}
                    onChange={(e) => setNewsletterType(e.target.value)}
                    required
                  >
                    <option value="divya_bhaskar">Divya Bhaskar</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Direct PDF URL (Optional)</label>
                  <input
                    type="text"
                    className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/newsletter.pdf"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">If provided, clicking "Read More" will display this PDF directly.</p>
                </div>
              </>
            )}

            <MultiImageInput
              images={images}
              onChange={setImages}
              label="Award Images"
            />

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Award description..."
                value={awardDescription}
                onChange={(e) => setAwardDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Year</label>
              <input
                type="number"
                min="1900"
                max="2099"
                step="1"
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2025"
                value={awardYear}
                onChange={(e) => setAwardYear(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? "Saving..." : (award ? "Update Award" : "Save Award")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AwardModal;
