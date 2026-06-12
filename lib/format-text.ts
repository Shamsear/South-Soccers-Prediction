/**
 * Text Formatting Utilities
 * 
 * Helper functions for formatting database text for display
 */

/**
 * Format underscore-separated text to Title Case with spaces
 * 
 * Examples:
 * - "group_a" -> "Group A"
 * - "group_stage" -> "Group Stage"
 * - "round_of_16" -> "Round Of 16"
 * 
 * @param text - Text with underscores
 * @returns Formatted text with spaces and proper capitalization
 */
export function formatUnderscoreText(text: string | null): string {
  if (!text) return ''
  
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format group name for display
 * Alias for formatUnderscoreText for backward compatibility
 */
export function formatGroupName(groupName: string | null): string | null {
  if (!groupName) return null
  return formatUnderscoreText(groupName)
}

/**
 * Format competition round for display
 * 
 * Examples:
 * - "group_stage" -> "Group Stage"
 * - "round_of_16" -> "Round Of 16"
 * - "quarter_finals" -> "Quarter Finals"
 */
export function formatCompetitionRound(round: string | null): string {
  if (!round) return ''
  return formatUnderscoreText(round)
}
