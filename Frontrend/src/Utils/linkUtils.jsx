// Utility functions for handling links in text

/**
 * Converts URLs in text to clickable links
 * @param {string} text - The text containing URLs
 * @returns {JSX.Element} - React element with clickable links
 */
export const linkifyText = (text) => {
  if (!text) return text;

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs and create clickable links
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
          onClick={(e) => {
            // If it's a CampusBuzz post link, handle it internally
            if (part.includes('/post/')) {
              e.preventDefault();
              const postId = part.split('/post/')[1];
              window.location.href = `/post/${postId}`;
            }
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

/**
 * Detects if text contains URLs
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains URLs
 */
export const containsUrls = (text) => {
  if (!text) return false;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

/**
 * Extracts URLs from text
 * @param {string} text - The text to extract URLs from
 * @returns {Array} - Array of URLs found in text
 */
export const extractUrls = (text) => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Creates a formatted share message with clickable link
 * @param {string} postId - The post ID
 * @param {string} content - Optional content preview
 * @returns {string} - Formatted share message
 */
export const createShareMessage = (postId, content = '') => {
  const url = `${window.location.origin}/post/${postId}`;
  const preview = content ? ` - "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"` : '';
  return `Check out this post from CampusBuzz${preview}: ${url}`;
};
