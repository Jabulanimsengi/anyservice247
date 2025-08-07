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
                    We believe in a simple, transparent, and mutually beneficial partnership. Our platform is designed to bring you genuine, high-quality leads, allowing you to focus on what you do best: delivering exceptional service.
                </p>

                <h3 className="text-xl font-semibold text-brand-dark mt-6">Transparent Pricing</h3>
                <p>
                    To ensure our platform remains active, secure, and is effectively advertised across the country, we have a straightforward service fee structure.
                </p>
                <ul>
                    <li><strong>Initial Setup & First Month:</strong> A once-off payment of **R209** is required to build your professional profile, verify your details, and list your services for the first month.</li>
                    <li><strong>Monthly Subscription:</strong> After the first month, a flat fee of **R129 per month** keeps your profile active and advertised to thousands of potential clients.</li>
                </ul>
                <p>
                    This monthly contribution is vital for the platform's sustainability. It allows us to pay our dedicated software engineers, maintain the technology, and run extensive marketing campaigns throughout South Africa to bring you a steady stream of job requests.
                </p>

                <h3 className="text-xl font-semibold text-brand-dark mt-6">Commission on Successful Jobs</h3>
                <p>
                    We are committed to a fair partnership. While we are still finalizing our commission structure, our goal is to implement a small, competitive rate on successfully completed jobs. This ensures we only succeed when you do. We are in the process of negotiating these rates with our partners to find a model that works for everyone.
                </p>

                <h3 className="text-xl font-semibold text-brand-dark mt-6">Getting Started</h3>
                <p>
                    As we are in our early stages, our payment process is direct and personal. Once your account has been created and your services are ready to be listed, we will send our banking details for you to make the initial payment of R209. We accept various payment methods and will work with you to make the process as smooth as possible.
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