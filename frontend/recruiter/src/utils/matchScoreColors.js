/**
 * Match Score Color Utilities
 * 
 * Generates smooth color gradients for match scores
 * Red (0%) → Yellow (50%) → Green (100%)
 */

/**
 * Generate a smooth color gradient from red to green based on match score
 * @param {number} score - Match score from 0-100
 * @returns {string} HSL color string
 */
export const getMatchScoreColor = (score) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Convert score to hue (0-120 degrees)
  // 0% = red (0°), 50% = yellow (60°), 100% = green (120°)
  const hue = (clampedScore / 100) * 120;
  
  // Use high saturation and medium lightness for vibrant colors
  const saturation = 75;
  const lightness = 50;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get text color (white or black) based on background luminance
 * Ensures good contrast for readability
 * @param {number} score - Match score from 0-100
 * @returns {string} 'white' or 'black'
 */
export const getMatchScoreTextColor = (score) => {
  // For scores below 40%, use white text for better contrast with dark red
  // For higher scores (yellows and greens), use black for better readability
  return score < 40 ? 'white' : 'black';
};

/**
 * Generate CSS background gradient for score displays
 * @param {number} score - Match score from 0-100
 * @returns {string} CSS gradient string
 */
export const getMatchScoreGradient = (score) => {
  const baseColor = getMatchScoreColor(score);
  const textColor = getMatchScoreTextColor(score);
  
  return {
    backgroundColor: baseColor,
    color: textColor
  };
};

/**
 * Get a slightly lighter version of the match score color for hover effects
 * @param {number} score - Match score from 0-100
 * @returns {string} HSL color string
 */
export const getMatchScoreColorHover = (score) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const hue = (clampedScore / 100) * 120;
  
  // Lighter version for hover
  const saturation = 75;
  const lightness = 60; // +10% lightness
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get score category label (for accessibility/tooltips)
 * @param {number} score - Match score from 0-100
 * @returns {string} Category label
 */
export const getMatchScoreLabel = (score) => {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  if (score >= 20) return 'Low Match';
  return 'Poor Match';
};

/**
 * Generate color for circular progress indicators
 * @param {number} score - Match score from 0-100
 * @returns {object} Color configuration for progress circles
 */
export const getProgressCircleColors = (score) => {
  return {
    stroke: getMatchScoreColor(score),
    background: 'rgb(55, 65, 81)', // gray-700
    textColor: getMatchScoreTextColor(score)
  };
};
