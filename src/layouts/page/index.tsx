import type React from 'react';
import { FooterPrimary } from '~/components/footer';
import { NavigationPrimary } from '~/components/navigation';

type LayoutPageProps = {
  children: React.ReactNode;
};
export default function LayoutPage({ children }: LayoutPageProps) {
  return (
    <>
      <NavigationPrimary />
      <main>{children}</main>
      <FooterPrimary />
    </>
  );
}
