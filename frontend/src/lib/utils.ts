import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this to your utils.js or utils.ts file if it doesn't exist already

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code or symbol (e.g., 'USD', 'FCFA', '€')
 * @param {string} locale - Optional locale for formatting (defaults to 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string, locale: string = 'en-US'): string => {
  // Special case for currencies like FCFA that don't have standard formatting
  if (currency === 'FCFA') {
    // Format number with commas for thousands
    const formattedAmount = new Intl.NumberFormat(locale).format(amount);
    return `${formattedAmount} FCFA`;
  }
  
  // For standard currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const formattedAmount = new Intl.NumberFormat(locale).format(amount);
    return `${formattedAmount} ${currency}`;
  }
};