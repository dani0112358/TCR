import { Link } from 'react-router-dom';
import { Thermometer, Radio, FlaskConical, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import { registry, categories, getByCategory, type Category } from '../data/registry';

const categoryIcons: Record<Category, React.ReactNode> = {
  Thermal: <Thermometer size={16} />,
  Telecom: <Radio size={16} />,
  Chemical: <FlaskConical size={16} />,
};

const categoryDescriptions: Record<Category, string> = {
  Thermal: 'Heat transfer, psychrometrics, and temperature-related calculations.',
  Telecom: 'Signal propagation, link budgets, and RF engineering tools.',
  Chemical: 'Solution chemistry, stoichiometry, and concentration equations.',
};

export default function Home() {
  return (
    <Layout>
      <Breadcrumb crumbs={[{ label: 'Home' }]} />

      <div className="mt-8 mb-10">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          The Calc Repository
        </h1>
        <p className="mt-2 text-zinc-400 max-w-xl" style={{ fontSize: '14px' }}>
          A focused set of engineering calculators for thermal, telecommunications, and chemical domains.
          Precise inputs, verified formulas, instant results.
        </p>
      </div>

      <div className="mb-8">
        <p className="text-zinc-600 mb-4" style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {registry.length} tools across {categories.length} categories
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const tools = getByCategory(category);
          return (
            <section key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-zinc-500">{categoryIcons[category]}</span>
                <h2 className="text-zinc-300 font-medium" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>
                  {category}
                </h2>
                <span className="text-zinc-700" style={{ fontSize: '11px' }}>— {categoryDescriptions[category]}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/calculators/${tool.slug}`}
                    className="group block p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors duration-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-zinc-200 font-medium group-hover:text-zinc-100 transition-colors duration-100" style={{ fontSize: '14px' }}>
                        {tool.name}
                      </h3>
                      <ArrowRight size={13} className="text-zinc-700 group-hover:text-zinc-500 mt-0.5 transition-colors duration-100" />
                    </div>
                    <p className="text-zinc-500 mb-3" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      {tool.description}
                    </p>
                    <span
                      className="text-zinc-600 mono"
                      style={{ fontSize: '11px' }}
                    >
                      {tool.formulaText}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Layout>
  );
}
