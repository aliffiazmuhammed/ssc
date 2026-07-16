import katex from 'katex';

export default function renderMathInText(text: string): string {
  if (!text) return '';
  
  // Matches $math$ or \(math\)
  const regex = /\$([^\$]+)\$|\\\((.*?)\\\)/g;
  
  return text.replace(regex, (match, p1, p2) => {
    const mathContent = p1 || p2;
    try {
      return katex.renderToString(mathContent, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (e) {
      console.warn('KaTeX rendering error:', e);
      return match;
    }
  });
}
