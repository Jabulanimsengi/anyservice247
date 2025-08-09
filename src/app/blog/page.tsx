// src/app/blog/page.tsx
'use client'; // <-- This makes it a Client Component

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
// import { Metadata } from 'next'; // <-- THIS LINE IS REMOVED
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const POSTS_PER_PAGE = 4;

type Post = {
  title: string;
  slug: string;
  content: string | null;
};

const BlogIndexPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  const fetchInitialPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('title, slug, content')
      .order('created_at', { ascending: false })
      .limit(POSTS_PER_PAGE);

    if (error) {
      console.error('Error fetching blog posts:', error.message);
    } else {
      setPosts(data || []);
      if (!data || data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  const loadMorePosts = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const from = nextPage * POSTS_PER_PAGE - POSTS_PER_PAGE;
    const to = nextPage * POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('title, slug, content')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching more posts:', error.message);
    } else {
      if (data && data.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...data]);
        setPage(nextPage);
      }
      if (!data || data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-teal">HomeService24/7 Blog</h1>
        <p className="text-lg text-gray-600 mt-2">Expert advice for your home and business.</p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.slug} className="p-6 border rounded-lg bg-white shadow-sm transition hover:shadow-md">
            <h2 className="text-2xl font-bold hover:text-blue-600">
              <Link href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-700 mt-2">{post.content?.substring(0, 150)}...</p>
            <div className="mt-4">
              <Link href={`/blog/${post.slug}`} className="font-semibold text-brand-teal hover:underline">
                Read More &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        {loading && <Spinner />}
        {!loading && hasMore && (
          <Button onClick={loadMorePosts} size="lg">
            Load More Articles
          </Button>
        )}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-gray-500">You've reached the end.</p>
        )}
        {!loading && posts.length === 0 && (
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