export type Category = 'Thermal' | 'Telecom' | 'Chemical';

export interface CalculatorEntry {
  id: string;
  slug: string;
  name: string;
  category: Category;
  formulaText: string;
  description: string;
}

export const registry: CalculatorEntry[] = [
  {
    id: 'dew-point',
    slug: 'dew-point',
    name: 'Dew Point',
    category: 'Thermal',
    formulaText: 'Td = T - ((100 - RH) / 5)',
    description:
      'Calculates the dew point temperature from dry-bulb temperature and relative humidity using the Magnus-Tetens approximation.',
  }
  {
    id: 'heat-index',
    slug: 'heat-index',
    name: 'Heat Index',
    category: 'Thermal',
    formulaText: 'Rothfusz Regression Equation',
    description:
      'Calculates the perceived temperature based on air temperature and relative humidity to assess heat stress risks.',
  },
  {
    id: 'fspl',
    slug: 'fspl',
    name: 'Free-Space Path Loss',
    category: 'Telecom',
    formulaText: 'FSPL = 20·log₁₀(d) + 20·log₁₀(f) + 92.45',
    description:
      'Computes the free-space path loss in decibels for a given frequency and link distance using the standard Friis transmission equation.',
  },
  {
    id: 'dilution',
    slug: 'dilution',
    name: 'Solution Dilution',
    category: 'Chemical',
    formulaText: 'C₁V₁ = C₂V₂',
    description:
      'Solves the dilution equation C₁V₁ = C₂V₂ for any single unknown variable given the other three values.',
  },
];

export const categories: Category[] = ['Thermal', 'Telecom', 'Chemical'];

export function getBySlug(slug: string): CalculatorEntry | undefined {
  return registry.find((e) => e.slug === slug);
}

export function getByCategory(category: Category): CalculatorEntry[] {
  return registry.filter((e) => e.category === category);
}
