import React from 'react';
import { InstitutionRegisterForm } from '../features/institution/components/InstitutionRegisterForm';
import { FadeIn } from '../components/animations/FadeIn';

export const InstitutionOnboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 py-12 flex flex-col items-center">
      <FadeIn delay={100} className="w-full flex flex-col items-center">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl font-extrabold text-[#000080] font-heading mb-4">
            Institution Portal
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Gain deep visibility into your cohort's readiness, identify curriculum gaps, and track student success metrics.
          </p>
        </div>
      </FadeIn>
      
      <FadeIn delay={200} className="w-full">
        <InstitutionRegisterForm />
      </FadeIn>
    </div>
  );
};
