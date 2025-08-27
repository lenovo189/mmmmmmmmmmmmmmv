/**
 * Convert markdown to HTML using a simple markdown parser
 * This handles the most common markdown syntax needed for AI responses
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    // Handle headers (### Header)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    
    // Handle bold text (**text**)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Handle italic text (*text*)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Handle code blocks (```code```)
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    
    // Handle inline code (`code`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Handle numbered lists
    .replace(/^(\d+)\.\s(.+)$/gm, '<li>$2</li>')
    
    // Handle bullet points
    .replace(/^-\s(.+)$/gm, '<li>$1</li>')
    
    // Handle line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs and handle lists
  html = '<p>' + html + '</p>';
  
  // Fix list formatting
  html = html.replace(/(<li>.*?<\/li>)/g, (match) => {
    return match;
  });
  
  // Group consecutive list items into proper lists
  html = html.replace(/(<li>.*?<\/li>(?:<br>)*)+/g, (match) => {
    const cleanMatch = match.replace(/<br>/g, '');
    return `<ul>${cleanMatch}</ul>`;
  });
  
  // Clean up empty paragraphs and extra breaks
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br>/g, '<p>');
  html = html.replace(/<br><\/p>/g, '</p>');
  
  return html;
}

/**
 * Convert markdown text to pdfmake content definition
 * This is a client-side implementation that doesn't use JSDOM
 */
export function markdownToPdfMake(markdown: string): any[] {
  if (!markdown) return [];
  
  try {
    const lines = markdown.split('\n');
    const content: any[] = [];
    let currentList: any[] = [];
    let currentCodeBlock = '';
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          content.push({
            text: currentCodeBlock.trim(),
            style: 'code',
            margin: [0, 10, 0, 10],
            background: '#f8f9fa'
          });
          currentCodeBlock = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          if (currentList.length > 0) {
            content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
            currentList = [];
          }
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        currentCodeBlock += line + '\n';
        continue;
      }
      
      // Handle empty lines
      if (line === '') {
        if (currentList.length > 0) {
          content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
          currentList = [];
        }
        continue;
      }
      
      // Handle headers
      if (line.startsWith('### ')) {
        if (currentList.length > 0) {
          content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
          currentList = [];
        }
        content.push({
          text: line.substring(4),
          style: 'h3',
          margin: [0, 15, 0, 8]
        });
        continue;
      }
      
      if (line.startsWith('## ')) {
        if (currentList.length > 0) {
          content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
          currentList = [];
        }
        content.push({
          text: line.substring(3),
          style: 'h2',
          margin: [0, 18, 0, 10]
        });
        continue;
      }
      
      if (line.startsWith('# ')) {
        if (currentList.length > 0) {
          content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
          currentList = [];
        }
        content.push({
          text: line.substring(2),
          style: 'h1',
          margin: [0, 20, 0, 12]
        });
        continue;
      }
      
      // Handle lists
      if (line.match(/^\d+\.\s/) || line.startsWith('- ')) {
        const listText = line.replace(/^\d+\.\s|-\s/, '');
        const processedText = processInlineMarkdown(listText);
        currentList.push(processedText);
        continue;
      }
      
      // Handle regular paragraphs
      if (currentList.length > 0) {
        content.push({ ul: [...currentList], margin: [0, 5, 0, 10] });
        currentList = [];
      }
      
      const processedText = processInlineMarkdown(line);
      content.push({
        text: processedText,
        margin: [0, 0, 0, 8],
        fontSize: 11,
        lineHeight: 1.4
      });
    }
    
    // Add any remaining list
    if (currentList.length > 0) {
      content.push({ ul: currentList, margin: [0, 5, 0, 10] });
    }
    
    return content;
  } catch (error) {
    console.error('Error converting markdown to PDF:', error);
    // Fallback to plain text
    return [{ text: markdown, fontSize: 11, margin: [0, 0, 0, 10] }];
  }
}

/**
 * Process inline markdown (bold, italic, code) within text
 */
function processInlineMarkdown(text: string): any {
  // For simple implementation, we'll handle basic formatting
  // More complex implementation could return rich text arrays
  
  // Check if text has formatting
  if (text.includes('**') || text.includes('`')) {
    const parts: any[] = [];
    let currentText = text;
    
    // Handle bold text
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ text: beforeText });
        }
      }
      
      // Add bold text
      parts.push({ text: match[1], bold: true });
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push({ text: remainingText });
      }
    }
    
    return parts.length > 0 ? parts : text;
  }
  
  return text;
}

/**
 * Enhanced markdown parser for React components
 * Returns structured data for custom React rendering
 */
export function parseMarkdownForReact(markdown: string) {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const elements: any[] = [];
  let currentList: string[] = [];
  let currentCodeBlock = '';
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push({ type: 'code', content: currentCodeBlock.trim() });
        currentCodeBlock = '';
        inCodeBlock = false;
      } else {
        // Start of code block
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      currentCodeBlock += line + '\n';
      continue;
    }
    
    // Handle headers
    if (line.startsWith('### ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'h3', content: line.substring(4) });
      continue;
    }
    
    if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'h2', content: line.substring(3) });
      continue;
    }
    
    if (line.startsWith('# ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'h1', content: line.substring(2) });
      continue;
    }
    
    // Handle lists
    if (line.match(/^(\d+)\.\s/) || line.startsWith('- ')) {
      const content = line.replace(/^(\d+)\.\s|-\s/, '');
      currentList.push(content);
      continue;
    }
    
    // Handle regular paragraphs
    if (line.trim() !== '') {
      if (currentList.length > 0) {
        elements.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      elements.push({ type: 'p', content: line });
    }
  }
  
  // Add any remaining list
  if (currentList.length > 0) {
    elements.push({ type: 'list', items: currentList });
  }
  
  return elements;
}