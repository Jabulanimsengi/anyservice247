// src/app/blog/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | HomeService24/7',
  description: 'Tips, guides, and advice for homeowners and service professionals in South Africa.',
};

const BlogIndexPage = async () => {
  const supabase = await createClient();
  
  // Fetch all posts from the new 'posts' table
  const { data: posts, error } = await supabase
    .from('posts')
    .select('title, slug, content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error.message);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">HomeService24/7 Blog</h1>
        <p className="text-lg text-gray-600 mt-2">Expert advice for your home and business.</p>
      </div>

      <div className="space-y-8">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.slug} className="p-6 border rounded-lg bg-white shadow-sm transition hover:shadow-md">
              <h2 className="text-2xl font-bold hover:text-blue-600">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              {/* Generate a short excerpt from the content */}
              <p className="text-gray-700 mt-2">{post.content?.substring(0, 150)}...</p>
              <div className="mt-4">
                <Link href={`/blog/${post.slug}`} className="font-semibold text-brand-teal hover:underline">
                  Read More &rarr;
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold">No articles found.</h3>
            <p className="text-gray-500">We're working hard to bring you valuable content. Please check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogIndexPage;
