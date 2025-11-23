import LayoutDashboard from '~/layouts/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <LayoutDashboard>{children}</LayoutDashboard>;
}
