import { twMerge } from 'tailwind-merge';

const statusVariants: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-purple-100 text-purple-800',
  Qualified: 'bg-cyan-100 text-cyan-800',
  Proposal: 'bg-amber-100 text-amber-800',
  Negotiation: 'bg-orange-100 text-orange-800',
  Won: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800',
};

const scoreVariants = {
  hot: 'bg-green-100 text-green-800',
  warm: 'bg-amber-100 text-amber-800',
  cold: 'bg-red-100 text-red-800',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'score' | 'default';
  value?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', value, className }: BadgeProps) {
  let colors = 'bg-gray-100 text-gray-800';

  if (variant === 'status' && value) {
    colors = statusVariants[value] || colors;
  } else if (variant === 'score' && value) {
    colors = scoreVariants[value as keyof typeof scoreVariants] || colors;
  }

  return (
    <span className={twMerge('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors, className)}>
      {children}
    </span>
  );
}
