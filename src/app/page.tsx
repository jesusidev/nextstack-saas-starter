'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  BenefitsSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  ProductShowcase,
  SocialProof,
  StructuredData,
} from '~/components/landing';
import LayoutPage from '~/layouts/page';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <LayoutPage>
      <StructuredData />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <ProductShowcase />
      <SocialProof />
      <CtaSection />
    </LayoutPage>
  );
}
