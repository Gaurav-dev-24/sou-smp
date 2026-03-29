export type BlogCategory = "blog" | "article";

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "blog", label: "Blog" },
  { value: "article", label: "Article" },
];

export interface Blog {
  id?: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: {
    name: string;
    image: string;
  };
  images: string[];
  githubLinks: string[];
  youtubeLinks: string[];
  status?: "pending" | "approved" | "rejected";
  created_at?: any;
  updated_at?: any;
}
