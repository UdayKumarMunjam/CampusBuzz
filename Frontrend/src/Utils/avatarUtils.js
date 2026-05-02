export const getLetterAvatar = (name) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const secondLetter = name && name.split(' ').length > 1 ? name.split(' ')[1].charAt(0).toUpperCase() : '';
  const letters = secondLetter ? `${firstLetter}${secondLetter}` : firstLetter;

  // WhatsApp exact gradient colors
  const gradients = [
    { start: '#009688', end: '#4CAF50' }, // Teal to Green
    { start: '#2196F3', end: '#21CBF3' }, // Blue to Light Blue
    { start: '#00BCD4', end: '#009688' }, // Cyan to Teal
    { start: '#3F51B5', end: '#2196F3' }, // Indigo to Blue
    { start: '#9C27B0', end: '#E91E63' }, // Purple to Pink
    { start: '#673AB7', end: '#9C27B0' }, // Deep Purple to Purple
    { start: '#FF9800', end: '#FF5722' }, // Orange to Deep Orange
    { start: '#795548', end: '#FF9800' }, // Brown to Orange
  ];
  const gradientIndex = firstLetter.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  const svg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${gradientIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradient.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradient.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="20" fill="url(#grad${gradientIndex})"/>
    <text x="20" y="25" font-family="Arial, sans-serif" font-size="${letters.length > 1 ? '12' : '16'}" fill="white" text-anchor="middle" font-weight="bold">${letters}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
};