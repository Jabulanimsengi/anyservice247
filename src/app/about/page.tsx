// src/app/about/page.tsx
import BackButton from '@/components/BackButton';

const AboutPage = () => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <BackButton />
        <h1 className="mb-6 text-4xl font-bold text-brand-dark text-center">About HomeService24/7</h1>
        
        <div className="prose lg:prose-lg max-w-none text-gray-700">
          <p>
            Welcome to HomeService24/7, South Africa's premier platform dedicated to connecting homeowners with trusted, skilled, and reliable service professionals. Our mission is to simplify the process of finding quality home services, making it safe, efficient, and hassle-free for everyone involved.
          </p>
          
          <h2 className="text-2xl font-semibold text-brand-dark mt-8">Our Vision</h2>
          <p>
            We are reinventing how South Africans discover and hire professionals for any job, big or small. In a market where trust and reliability are paramount, we stand out by meticulously vetting every service provider on our platform. Our commitment goes beyond just making a recommendation; <strong>we are involved from start to finish to ensure you receive the best service.</strong> We believe that by building a community of top-tier professionals, we can empower homeowners to maintain and improve their properties with confidence, while also helping skilled artisans and service businesses grow and succeed.
          </p>

          <h2 className="text-2xl font-semibold text-brand-dark mt-8">Why Choose Us?</h2>
          <ul>
            <li><strong>Verified Professionals:</strong> Every provider is vetted for quality, reliability, and professionalism, so you can hire with peace of mind.</li>
            <li><strong>End-to-End Support:</strong> We don’t just connect you; we are your dedicated partner until the job is completed to your satisfaction, ensuring you receive the highest standard of service.</li>
            <li><strong>Seamless Experience:</strong> From finding a provider to booking an appointment and making a payment, our platform is designed to be intuitive and user-friendly.</li>
            <li><strong>Transparent and Fair:</strong> We believe in clear communication and transparent pricing. Get upfront rates and clear quotes with no hidden fees.</li>
            <li><strong>Supporting Local Business:</strong> We are passionate about supporting the skilled tradespeople and local businesses that form the backbone of our communities.</li>
          </ul>
          
          <p className="mt-8">
            Thank you for choosing HomeService24/7. We look forward to helping you build, maintain, and love your home.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;