export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  author_avatar_url?: string | null;
  date: string;
  readTime: string;
  featured: boolean;
  coverEmoji: string;
  featured_image_url?: string | null;
};

// Static fallback array (kept for backwards compatibility; public page now reads from DB)
export const BLOG_POSTS: BlogPost[] = [];
