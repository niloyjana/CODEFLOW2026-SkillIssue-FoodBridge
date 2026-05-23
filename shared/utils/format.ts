/**
 * Formats an ISO date string into a human-readable local date and time.
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Formats a count of food portions.
 */
export const formatPortions = (portions: number): string => {
  return `${portions} ${portions === 1 ? 'portion' : 'portions'}`;
};

/**
 * Formats predicted food waste in kilograms.
 */
export const formatWaste = (kg: number): string => {
  return `${kg.toFixed(1)} kg`;
};

/**
 * Capitalizes the first letter of a word.
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
