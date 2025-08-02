// src/components/CourseCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/Button';

const CourseCard = ({ course }: { course: any }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image 
          src={course.image_url || '/placeholder.png'} 
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 h-24 overflow-hidden">{course.description}</p>
        <Link href={`/academy/${course.id}`}>
            <Button className="w-full">Start Learning</Button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;