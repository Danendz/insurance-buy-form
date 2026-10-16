import { formatNumber } from '@/shared/utils/format';

export const formatLiability = (amount: number) => `${formatNumber(amount)} EUR`;

export const formatPrice = (amount: number) =>
  `EUR ${formatNumber(amount, { locale: 'en-US', fractionDigits: 2 })}`;
