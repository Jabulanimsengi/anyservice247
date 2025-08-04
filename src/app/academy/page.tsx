// src/app/academy/page.tsx
import { supabase } from '@/lib/supabase';
import CourseCard from '@/components/CourseCard';
import BackButton from '@/components/BackButton';

export const dynamic = 'force-dynamic';

const AcademyPage = async () => {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at');

  if (error) {
    console.error("Error fetching courses:", error.message);
    return <p className="text-center text-red-500">Failed to load courses.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">Service Provider Academy</h1>
        <p className="mb-8 text-lg text-gray-600">Learn new skills and get certified to build trust with clients.</p>

        {/* New Informational Section */}
        <div className="mb-12 rounded-lg border-2 border-dashed border-brand-teal bg-teal-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-brand-dark">Exciting Developments Underway!</h2>
          <p className="mt-4 max-w-3xl mx-auto text-gray-700">
            We are hard at work expanding our educational library to bring you even more valuable content. In the near future, we will be partnering with reputable, top-tier service providers and industry experts to co-create courses. 
            <br /><br />
            Our goal is to elevate the quality of work across the board, providing you with the knowledge and official certifications you need to excel in your trade, increase customer trust, and grow your business. Stay tuned for more updates!
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default AcademyPage;