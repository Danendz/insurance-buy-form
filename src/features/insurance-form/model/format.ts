import { formatNumber, titleCaseUpper } from '@/shared/utils/format';

const COUNTRY_NAME_OPTIONS = {
  lowercase: new Set(['и', 'в']),
  uppercase: new Set(['США', 'ОАЭ']),
};

export const formatCountryName = (name: string) => titleCaseUpper(name, COUNTRY_NAME_OPTIONS);

export const formatLiability = (amount: number) => `${formatNumber(amount)} EUR`;

export const formatPrice = (amount: number) =>
  `EUR ${formatNumber(amount, { locale: 'en-US', fractionDigits: 2 })}`;
