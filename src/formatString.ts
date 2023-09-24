/**
 * Format a string
 * @param format Format string
 * @param args Arguments
 * @returns Formatted string
 */
function formatString(format: string, ...args: any[]): string {
  return format.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number] 
      : match
    ;
  });
};

export default formatString