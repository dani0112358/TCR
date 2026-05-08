import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main
        className="md:pl-[280px] min-h-screen"
      >
        <div className="max-w-[1200px] mx-auto px-6 py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
