import React from 'react';
import { IndustryRegisterForm } from '../features/industry/components/IndustryRegisterForm';
import { FadeIn } from '../components/animations/FadeIn';

export const IndustryOnboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 py-12 flex flex-col items-center">
      <FadeIn delay={100} className="w-full flex flex-col items-center">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl font-extrabold text-[#000080] font-heading mb-4">
            Join VIDYUT as an Industry Partner
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Create opportunities and connect with verified, skill-ready student talent.
          </p>
        </div>
      </FadeIn>
      
      <FadeIn delay={200} className="w-full">
        <IndustryRegisterForm />
      </FadeIn>
    </div>
  );
};


