export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-launch-your-saas",
    category: "Growth",
    title: "How to Launch Your SaaS to an Audience That Actually Cares",
    excerpt: "Most launches flop because founders talk to the wrong people. Here's how to find your first 100 real users before you even launch.",
    author: "The NBT Team",
    date: "Apr 18, 2025",
    readTime: "6 min",
    featured: true,
  },
  {
    slug: "build-in-public-guide",
    category: "Strategy",
    title: "Build in Public: The Complete Founder's Guide for 2025",
    excerpt: "Transparency isn't just a marketing tactic — it's a moat. Learn how top founders use public building to grow faster.",
    author: "The NBT Team",
    date: "Apr 11, 2025",
    readTime: "8 min",
    featured: false,
  },
  {
    slug: "ai-tools-worth-paying-for",
    category: "AI Tools",
    title: "The 10 AI Tools Actually Worth Paying For Right Now",
    excerpt: "We tested 80+ AI tools so you don't have to. These are the ones that made it into our daily workflow.",
    author: "The NBT Team",
    date: "Apr 5, 2025",
    readTime: "5 min",
    featured: false,
  },
  {
    slug: "product-hunt-vs-nextbigtool",
    category: "Comparison",
    title: "Next Big Tool vs Product Hunt: What's Different?",
    excerpt: "Why we built this platform and what we do differently for early-stage tools and indie founders.",
    author: "The NBT Team",
    date: "Mar 28, 2025",
    readTime: "4 min",
    featured: false,
  },
  {
    slug: "founder-crm-guide",
    category: "Sales",
    title: "Your Upvoters Are Your Best Leads — Here's How to Reach Them",
    excerpt: "The people who upvote your tool are warm leads. Our CRM feature lets Core subscribers follow up. Here's the playbook.",
    author: "The NBT Team",
    date: "Mar 20, 2025",
    readTime: "5 min",
    featured: false,
  },
];
