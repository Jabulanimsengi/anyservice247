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
      <h1 className="mb-2 text-4xl font-bold">Service Provider Academy</h1>
      <p className="mb-8 text-lg text-gray-600">Learn new skills and get certified to build trust with clients.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default AcademyPage;