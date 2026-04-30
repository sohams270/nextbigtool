export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  coverEmoji: string;
};

// Add real posts here when ready to publish
export const BLOG_POSTS: BlogPost[] = [];
