import LayoutPage from '~/layouts/page';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <LayoutPage>{children}</LayoutPage>;
}
