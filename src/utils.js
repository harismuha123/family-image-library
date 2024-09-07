/**
 * Generates a random linear gradient.
 * @returns {string} A CSS linear gradient string.
 */
export const getRandomGradient = () => {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  return `linear-gradient(45deg, ${color1}, ${color2})`;
};

/**
 * Generates a random color in hexadecimal format.
 * @returns {string} A random color string.
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
