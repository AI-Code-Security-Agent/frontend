import React from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  GitCompare, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Shield, 
  Info,
  ChevronRight,
  FileCode,
  Terminal,
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Highlight } from 'prism-react-renderer';

// Main formatting function
export const formatContent = (
  content: string,
  copiedBlocks: Set<number>,
  copyToClipboard: (code: string, index: number) => void
) => {
  if (typeof content !== "string") {
    console.error("Expected string but got:", typeof content, content);
    return null;
  }

  // Process diff blocks first
  content = preprocessDiffBlocks(content);
  
  // Enhanced regex to handle different code block types
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Code block detection
    if (part.startsWith("```") && part.endsWith("```")) {
      const lines = part.split("\n");
      const langLine = lines[0].replace("```", "").trim();
      const codeContent = lines.slice(1, -1).join("\n");

      // Check if this is a diff block
      if (langLine === "diff" || isDiffContent(codeContent)) {
        return renderModernDiffBlock(codeContent, index, copiedBlocks, copyToClipboard);
      }

      // Regular code block
      return renderModernCodeBlock(codeContent, langLine || "text", index, copiedBlocks, copyToClipboard);
    }

    // Plain text formatting
    return (
      <div key={index} className="prose dark:prose-invert max-w-none">
        {formatTextContent(part)}
      </div>
    );
  });
};

// Preprocess to detect inline diff blocks
const preprocessDiffBlocks = (content: string): string => {
  // Pattern to match diff-like content not in code blocks
  const diffPattern = /(?:^|\n)((?:---[\s\S]*?\+\+\+[\s\S]*?)?(?:@@[\s\S]*?@@[\s\S]*?)(?:\n[-+].*)+)/gm;
  
  return content.replace(diffPattern, (match) => {
    // Wrap detected diff in code block
    return '\n```diff\n' + match.trim() + '\n```\n';
  });
};

const isDiffContent = (code: string): boolean => {
  const lines = code.split('\n');
  const diffIndicators = lines.filter(line => 
    line.startsWith('+++') || 
    line.startsWith('---') || 
    line.startsWith('+') || 
    line.startsWith('-') ||
    line.includes('@@')
  );
  return diffIndicators.length > 2; // More robust detection
};

const renderModernDiffBlock = (
  code: string, 
  index: number, 
  copiedBlocks: Set<number>, 
  copyToClipboard: (code: string, index: number) => void
) => {
  const lines = code.split('\n');
  const changes = parseDiff(lines);
  
  return (
    <div key={index} className="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 group">
      {/* Modern Diff Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <GitCompare className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Code Diff</span>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-white/80 flex items-center">
                  <Plus className="h-3 w-3 mr-1" />
                  {changes.additions} additions
                </span>
                <span className="text-xs text-white/80 flex items-center">
                  <Minus className="h-3 w-3 mr-1" />
                  {changes.deletions} deletions
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(code, index)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {copiedBlocks.has(index) ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Diff
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unified Diff View */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <pre className="text-sm">
            {changes.lines.map((line, i) => (
              <div
                key={i}
                className={`
                  px-4 py-1 font-mono text-xs leading-relaxed
                  ${line.type === 'add' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : ''}
                  ${line.type === 'remove' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' : ''}
                  ${line.type === 'header' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' : ''}
                  ${line.type === 'normal' ? 'text-gray-700 dark:text-gray-400' : ''}
                  hover:bg-opacity-70 transition-colors
                `}
              >
                <span className="select-none inline-block w-8 text-center mr-3 opacity-50">
                  {line.type === 'add' && '+'}
                  {line.type === 'remove' && '-'}
                  {line.type === 'header' && '@'}
                  {line.type === 'normal' && ' '}
                </span>
                <span>{line.content}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

const parseDiff = (lines: string[]) => {
  let additions = 0;
  let deletions = 0;
  const parsedLines = [];

  for (const line of lines) {
    let type = 'normal';
    let content = line;

    if (line.startsWith('---') || line.startsWith('+++')) {
      type = 'header';
      content = line.replace(/^[-+]{3}\s*/, '');
    } else if (line.includes('@@')) {
      type = 'header';
    } else if (line.startsWith('+')) {
      type = 'add';
      additions++;
      content = line.substring(1);
    } else if (line.startsWith('-')) {
      type = 'remove';
      deletions++;
      content = line.substring(1);
    }

    parsedLines.push({ type, content });
  }

  return { lines: parsedLines, additions, deletions };
};

const renderModernCodeBlock = (
  code: string, 
  language: string, 
  index: number, 
  copiedBlocks: Set<number>, 
  copyToClipboard: (code: string, index: number) => void
) => {
  // Clean up any trailing symbols or artifacts
  code = code.replace(/[^\w\s\n\r\t{}()\[\];:'"`,.<>/?\\|+=\-_!@#$%^&*~]/g, '').trim();
  
  const getLanguageIcon = () => {
    const iconClass = "h-4 w-4";
    switch(language.toLowerCase()) {
      case 'python':
      case 'py':
        return <FileCode className={iconClass} />;
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
      case 'tsx':
        return <Terminal className={iconClass} />;
      default:
        return <Code className={iconClass} />;
    }
  };

  return (
    <div key={index} className="my-6 group">
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
        {/* Modern Code Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                {getLanguageIcon()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {language}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(code, index)}
              className="opacity-0 group-hover:opacity-100 transition-all"
            >
              {copiedBlocks.has(index) ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <Highlight code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} bg-gray-800 dark:bg-gray-900 p-5 overflow-x-auto`}
              style={{ ...style,  }}
            >
              {tokens.map((line, i) => (
                <div 
                  key={i} 
                  {...getLineProps({ line, key: i })} 
                  className="px-2 -mx-2 rounded transition-colors"
                >
                  <span className="select-none text-gray-400 dark:text-gray-600 mr-4 text-xs inline-block w-8 text-right">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};

const formatTextContent = (text: string) => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: { content: string, index: number }[] = [];
  let listType: "ol" | "ul" | null = null;
  let listStartIndex = 1;

  const flushList = () => {
    if (!listType || listBuffer.length === 0) return;
    
    if (listType === "ol") {
      elements.push(
        <ol
          key={elements.length}
          className="space-y-3 my-6"
          style={{ counterReset: `item ${listStartIndex - 1}` }}
        >
          {listBuffer.map((item, i) => (
            <li
              key={i}
              className="flex items-start space-x-3 text-gray-700 dark:text-gray-300"
              style={{ counterIncrement: 'item' }}
            >
              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
                {item.index}
              </span>
              <span className="text-sm leading-relaxed pt-1">{formatInlineElements(item.content)}</span>
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="space-y-2 my-6">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
              <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{formatInlineElements(item.content)}</span>
            </li>
          ))}
        </ul>
      );
    }
    listBuffer = [];
    listType = null;
    listStartIndex = 1;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    
    if (!line) {
      flushList();
      return;
    }

    // Modern heading rendering
    if (/^#{1,6}\s+/.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#+\s+/, "").replace(/^#\s*/, ""); // Remove any # symbols
      
      const getHeadingIcon = () => {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('vulnerable') || lowerContent.includes('danger') || lowerContent.includes('xss')) {
          return <AlertTriangle className="h-5 w-5 text-red-500" />;
        }
        if (lowerContent.includes('safe') || lowerContent.includes('secure') || lowerContent.includes('fix')) {
          return <Shield className="h-5 w-5 text-green-500" />;
        }
        if (lowerContent.includes('step') || /^\d+\./.test(content)) {
          return <Sparkles className="h-5 w-5 text-purple-500" />;
        }
        if (lowerContent.includes('reason') || lowerContent.includes('analysis')) {
          return <Info className="h-5 w-5 text-blue-500" />;
        }
        return <Zap className="h-5 w-5 text-indigo-500" />;
      };

      const headingClasses = [
        "text-2xl font-bold", // h1
        "text-xl font-semibold", // h2
        "text-lg font-semibold", // h3
        "text-base font-medium", // h4
        "text-sm font-medium", // h5
        "text-sm font-medium", // h6
      ];

      elements.push(
        <div key={elements.length} className={`flex items-center space-x-3 ${level === 1 ? 'mt-8 mb-6' : 'mt-6 mb-4'}`}>
          {getHeadingIcon()}
          <h2 className={`${headingClasses[level - 1]} text-gray-800 dark:text-gray-200`}>
            {formatInlineElements(content)}
          </h2>
        </div>
      );
      return;
    }

    // Modern blockquote
    if (/^>\s+/.test(line)) {
      flushList();
      elements.push(
        <div key={elements.length} className="my-4 border-l-4 border-blue-400 dark:border-blue-600">
          <blockquote className="pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
            <p className="text-sm italic text-gray-700 dark:text-gray-300">
              {formatInlineElements(line.replace(/^>\s+/, ""))}
            </p>
          </blockquote>
        </div>
      );
      return;
    }

    // Fixed ordered list parsing
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (orderedMatch) {
      const itemNumber = parseInt(orderedMatch[1]);
      const itemContent = orderedMatch[2];
      
      if (listType !== "ol") {
        flushList();
        listType = "ol";
        listStartIndex = itemNumber;
      }
      
      listBuffer.push({ content: itemContent, index: itemNumber });
      return;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const item = line.replace(/^[-*]\s+/, "");
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listBuffer.push({ content: item, index: 0 });
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={elements.length} className="text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
        {formatInlineElements(line)}
      </p>
    );
  });

  flushList();
  return <>{elements}</>;
};

const formatInlineElements = (text: string): React.ReactNode[] => {
  // Remove any standalone # symbols
  text = text.replace(/^#\s*/, '');
  
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\)|✅|❌|✓|✗)/g;
  const parts = text.split(tokenRegex).filter((p) => p !== undefined && p !== "");

  return parts.map((part, i) => {
    // Handle emoji indicators
    if (part === '✅' || part === '✓') {
      return <CheckCircle2 key={i} className="inline h-4 w-4 text-green-500 mx-1" />;
    }
    if (part === '❌' || part === '✗') {
      return <XCircle key={i} className="inline h-4 w-4 text-red-500 mx-1" />;
    }

    // Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-700">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Links
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-gray-700 dark:text-gray-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={i}>{part}</span>;
  });
};

// Component wrapper
interface MessageFormatterProps {
  content: string;
  copiedBlocks: Set<number>;
  copyToClipboard: (code: string, index: number) => void;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({
  content,
  copiedBlocks,
  copyToClipboard,
}) => {
  return (
    <div className="message-content max-w-full">
      {formatContent(content, copiedBlocks, copyToClipboard)}
    </div>
  );
};

export default MessageFormatter;