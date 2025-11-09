export const COLORS = {
  primary: '#912F40',
  secondary: '#1E293B',
  background: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const JOB_TYPES = [
  { label: 'Full Time', value: 'full-time' },
  { label: 'Part Time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
] as const;

export const APPLICATION_STATUSES = [
  { label: 'Pending', value: 'pending', color: '#F59E0B' },
  { label: 'Reviewing', value: 'reviewing', color: '#3B82F6' },
  { label: 'Shortlisted', value: 'shortlisted', color: '#8B5CF6' },
  { label: 'Rejected', value: 'rejected', color: '#EF4444' },
  { label: 'Accepted', value: 'accepted', color: '#10B981' },
] as const;
