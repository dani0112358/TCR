import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, FlaskConical, Radio, Thermometer, Menu, X } from 'lucide-react';
import { categories, getByCategory, type Category } from '../data/registry';

const categoryIcons: Record<Category, React.ReactNode> = {
  Thermal: <Thermometer size={14} />,
  Telecom: <Radio size={14} />,
  Chemical: <FlaskConical size={14} />,
};

function CategoryFolder({ category, isOpen, onToggle }: {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const tools = getByCategory(category);

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors duration-100 group"
        style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}
      >
        <span className="flex items-center gap-2">
          {categoryIcons[category]}
          {category}
        </span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {isOpen && (
        <div className="ml-2 mt-0.5 border-l border-zinc-800 pl-3 pb-1">
          {tools.map((tool) => {
            const active = location.pathname === `/calculators/${tool.slug}`;
            return (
              <Link
                key={tool.id}
                to={`/calculators/${tool.slug}`}
                className={`block px-2 py-1.5 rounded transition-colors duration-100 ${
                  active
                    ? 'text-zinc-100 bg-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
                style={{ fontSize: '13px' }}
              >
                {tool.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [openCategories, setOpenCategories] = useState<Set<Category>>(new Set(categories));
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCategory(cat: Category) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-zinc-800">
        <Link to="/" className="block" onClick={() => setMobileOpen(false)}>
          <span
            className="text-zinc-100 font-semibold tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}
          >
            TCR
          </span>
          <span className="text-zinc-500 ml-2" style={{ fontSize: '11px' }}>
            The Calc Repository
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-zinc-600" style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Tools
        </p>
        {categories.map((cat) => (
          <CategoryFolder
            key={cat}
            category={cat}
            isOpen={openCategories.has(cat)}
            onToggle={() => toggleCategory(cat)}
          />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-zinc-600" style={{ fontSize: '10px' }}>
          {new Date().getFullYear()} — TCR
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors duration-100"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full z-40 bg-zinc-900 border-r border-zinc-800 transition-transform duration-150 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full bg-zinc-900 border-r border-zinc-800"
        style={{ width: '280px' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
