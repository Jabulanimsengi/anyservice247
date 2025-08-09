// src/app/blog/[slug]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface PostPageProps {
  params: { slug: string };
}

// Dynamically generate metadata for each blog post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const supabase = await createClient();
    const { data: post } = await supabase
        .from('posts')
        .select('title, content')
        .eq('slug', params.slug)
        .single();

    if (!post) {
        return {
            title: 'Post Not Found'
        };
    }

    return {
        title: post.title,
        description: post.content?.substring(0, 160), // Use the beginning of the post as the description
    };
}

const PostPage = async ({ params }: PostPageProps) => {
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from('posts')
        .select('*, profiles ( full_name, business_name )') // Join with profiles to get author name
        .eq('slug', params.slug)
        .single();

    if (error || !post) {
        notFound();
    }

    const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
    const authorName = author?.business_name || author?.full_name || 'The HomeService24/7 Team';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <BackButton />
            <article className="mt-8">
                {/* --- THIS LINE IS UPDATED --- */}
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-brand-teal">{post.title}</h1>
                <div className="flex items-center text-gray-500 mb-6">
                    <span>By {authorName}</span>
                    <span className="mx-2">&bull;</span>
                    <span>{new Date(post.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                {post.image_url && (
                    <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Use prose for nice article formatting */}
                <div className="prose lg:prose-xl max-w-none">
                    <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </div>
            </article>
        </div>
    );
};

export default PostPage;