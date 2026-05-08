import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-zinc-500" style={{ fontSize: '12px' }}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={10} className="text-zinc-700" />}
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-zinc-300 transition-colors duration-100">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-zinc-300">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
