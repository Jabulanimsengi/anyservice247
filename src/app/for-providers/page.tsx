// src/app/for-providers/page.tsx
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const ForProvidersPage = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <BackButton />
        <h1 className="mb-4 text-4xl font-bold text-brand-dark text-center">Partner with HomeService24/7</h1>
        <p className="text-lg text-gray-600 text-center mb-10">Grow your business and connect with clients who need your skills.</p>
        
        <div className="bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-brand-dark mb-6">Our Partnership Model</h2>
            
            <div className="prose max-w-none text-gray-700">
                <p>
                    We believe in a simple, transparent, and mutually beneficial partnership. Our platform is designed to bring you genuine, high-quality leads, allowing you to focus on what you do best: delivering exceptional service. To ensure our platform is sustainable and effectively marketed, we've developed flexible options that work for your business.
                </p>

                <h3 className="text-xl font-semibold text-brand-dark mt-8">Flexible Partnership Tiers</h3>
                <p>
                    Choose the plan that best suits your business goals. Our tiers are designed to reward our most active and committed partners.
                </p>
                <ul>
                    <li>
                        <strong>Basic Tier:</strong> Perfect for getting started. For a lower monthly fee of <strong>R99</strong>, you get full access to the platform with a standard commission of <strong>18%</strong> on successfully completed jobs.
                    </li>
                    <li>
                        <strong>Premium Tier:</strong> Designed for established businesses. For a monthly fee of <strong>R249</strong>, you benefit from a significantly reduced commission of just <strong>10%</strong> on successfully completed jobs, maximizing your earnings.
                    </li>
                </ul>
                <p>
                    These contributions are vital for the platform's health. They allow us to pay our dedicated software engineers, maintain our technology, and run extensive marketing campaigns across South Africa to bring you a steady stream of job requests.
                </p>

                <h3 className="text-xl font-semibold text-brand-dark mt-6">Getting Started</h3>
                <p>
                    As we are in our early stages, our payment process is direct and personal. Once your account has been created and your services are ready to be listed, we will send our banking details for you to make the initial payment for your chosen tier. We accept various payment methods and will work with you to make the process as smooth as possible.
                </p>
            </div>

            <div className="text-center mt-8">
                <Link href="/#">
                    <Button size="lg">Become a Partner Today</Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForProvidersPage;