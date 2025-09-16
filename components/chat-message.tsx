import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  User,
  Database,
  Brain,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Code,
  FileText,
  List,
  Hash,
  Download,
  ThumbsDown,
  ThumbsUp,
  Edit,
  Edit2,
} from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Highlight } from "prism-react-renderer";
import { apiService } from "@/lib/api";
interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(
    message.feedback ?? null
  );

  // console.log('message : ', message)
  // console.log('feedback value of state :',feedback)
  // console.log('initial feedback :', message.feedback)

  const [showAllSources, setShowAllSources] = useState(false);
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());
  const isUser = message.role === "user";
  const isRAG = message.modelType === "rag";

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Content copied to clipboard!");
  };

  const handleDownloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([message.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `response-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Content downloaded!");
  };

  const copyToClipboard = useCallback(
    async (text: string, blockIndex: number) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedBlocks((prev) => new Set(prev).add(blockIndex));
        toast.success("Code copied to clipboard!");

        setTimeout(() => {
          setCopiedBlocks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockIndex);
            return newSet;
          });
        }, 2000);
      } catch (err) {
        toast.error("Failed to copy code");
      }
    },
    []
  );

  const formatContent = (content: string) => {
    if (typeof content !== "string") {
      console.error("Expected string but got:", typeof content, content);
      return null;
    }
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // code block
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.split("\n");
        const langLine = lines[0].replace("```", "").trim();
        const language = langLine || "text";
        const code = lines.slice(1, -1).join("\n");

        return (
          <div key={index} className="my-4 group">
            {/* header with copy button */}
            <div className="relative">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {language}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(code, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedBlocks.has(index) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* syntax‑highlighted code */}
              <Highlight code={code} language={language}>
                {({
                  className,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={`prism-code ${className} bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg border border-t-0 overflow-x-auto`}
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
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
      }

      // plain text
      return (
        <div key={index} className="prose dark:prose-invert max-w-none">
          {formatTextContent(part)}
        </div>
      );
    });
  };

  /**
   * Parses markdown‑style text into headings, lists, blockquotes, paragraphs.
   */
  const formatTextContent = (text: string) => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    let listType: "ol" | "ul" | null = null;

    const flushList = () => {
      if (!listType || listBuffer.length === 0) return;
      if (listType === "ol") {
        elements.push(
          <ol
            key={elements.length}
            className="list-decimal list-inside space-y-2 ml-6 my-4"
          >
            {listBuffer.map((item, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
              >
                {formatInlineElements(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul
            key={elements.length}
            className="list-disc list-inside space-y-1 ml-4 my-4"
          >
            {listBuffer.map((item, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
              >
                {formatInlineElements(item)}
              </li>
            ))}
          </ul>
        );
      }
      listBuffer = [];
      listType = null;
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) {
        // blank → flush current list or skip
        flushList();
        return;
      }

      // headings
      if (/^#{1,6}\s+/.test(line)) {
        flushList();
        const level = line.match(/^#+/)![0].length;
        const content = line.replace(/^#+\s+/, "");
        elements.push(
          <div
            key={elements.length}
            className={`mt-4 mb-2 flex items-center space-x-2 ${
              level === 1
                ? "text-xl font-bold"
                : level === 2
                ? "text-lg font-semibold"
                : "text-base font-medium"
            } text-gray-800 dark:text-gray-200`}
          >
            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{formatInlineElements(content)}</span>
          </div>
        );
        return;
      }

      // blockquote
      if (/^>\s+/.test(line)) {
        flushList();
        elements.push(
          <blockquote
            key={elements.length}
            className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-400 my-3"
          >
            {formatInlineElements(line.replace(/^>\s+/, ""))}
          </blockquote>
        );
        return;
      }

      // ordered list item
      if (/^\d+\.\s+/.test(line)) {
        const item = line.replace(/^\d+\.\s+/, "");
        if (listType === "ol" || listType === null) {
          listType = "ol";
          listBuffer.push(item);
        } else {
          // was ul, flush first
          flushList();
          listType = "ol";
          listBuffer.push(item);
        }
        return;
      }

      // unordered list item
      if (/^[-*]\s+/.test(line)) {
        const item = line.replace(/^[-*]\s+/, "");
        if (listType === "ul" || listType === null) {
          listType = "ul";
          listBuffer.push(item);
        } else {
          // was ol, flush first
          flushList();
          listType = "ul";
          listBuffer.push(item);
        }
        return;
      }

      // anything else → paragraph
      flushList();
      elements.push(
        <p
          key={elements.length}
          className="text-sm leading-relaxed mb-3 text-gray-800 dark:text-gray-200"
        >
          {formatInlineElements(line)}
        </p>
      );
    });

    // end‑of‑text flush
    flushList();
    return <>{elements}</>;
  };

  /**
   * Handles inline `code`, **bold**, *italic*, and [link](url)
   */
  const formatInlineElements = (text: string): React.ReactNode[] => {
    // split out code spans, bold, italic, links
    const tokenRegex =
      /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g;

    const parts = text
      .split(tokenRegex)
      .filter((p) => p !== undefined && p !== "");

    return parts.map((part, i) => {
      // code span
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // link [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            {linkMatch[1]}
          </a>
        );
      }

      // bold
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            className="font-semibold text-gray-900 dark:text-gray-100"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      // italic
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      // fallback plain text
      return <span key={i}>{part}</span>;
    });
  };

  const handleFeedback = async (newFeedback: "like" | "dislike" | null) => {
    const prev = feedback;
    setFeedback(newFeedback);

    try {
      await apiService.updateFeedback(message.id, newFeedback);
      console.log('Feedback is updated!')
    } catch (err) {
      console.error("Failed to update feedback:", err);
      setFeedback(prev); 
    }
  };

  const ModelIcon = isRAG ? Database : Brain;
  const modelLabel = isRAG ? "RAG" : "LLM";
  const modelColor = isRAG
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  // const formatted = formatContent(message.content);
  // console.log("Formatted content:", formatted);

  if (isUser) {
    return (
      <div className="flex justify-end space-x-3 mb-6">
        <div className="max-w-[80%] space-y-2">
          <div className="flex items-center justify-end space-x-2">
            <Badge variant="outline" className={modelColor}>
              <ModelIcon className="h-3 w-3 mr-1" />
              {modelLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          <div>
            {/* User message bubble */}
            <div className="bg-primary text-primary-foreground p-4 rounded-lg rounded-br-sm shadow-sm max-w-full">
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed ">
                {message.content}
              </p>
            </div>

            {/* Actions */}
            {message.content && (
              <div className="flex justify-end items-center gap-3 mt-0 pt-0 text-muted-foreground">
                {/* Copy */}
                <button
                  title="Copy"
                  onClick={handleCopyContent}
                  className="p-2 rounded-full hover:bg-muted transition"
                >
                  <Copy className="h-4 w-4" />
                </button>

                {/* Edit */}
                <button
                  title="Edit"
                  // onClick={handleEditMessage}
                  className="p-2 rounded-full hover:bg-muted transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start space-x-3 mb-6">
      <div className="max-w-[85%] space-y-3">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={modelColor}>
            <ModelIcon className="h-3 w-3 mr-1" />
            {modelLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          {/* {message.sessionId && (
            <span className="text-xs text-muted-foreground">
              Session: {message.sessionId.slice(0, 8)}...
            </span>
          )} */}
        </div>

        <div>
          {/* <div className="bg-muted/30 p-4 rounded-lg rounded-bl-sm shadow-sm border border-muted/40"> */}
          <div className="bg-muted p-4 rounded-lg rounded-bl-sm border border-muted/40  dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            {/* Loader / Thinking State */}
            <div className="flex items-center gap-2 mb-2 ">
              {message.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {message.isLoading && !isRAG && (
                <span className="text-xs text-muted-foreground">
                  Thinking...
                </span>
              )}
              {message.isLoading && isRAG && (
                <span className="text-xs text-muted-foreground">
                  Searching knowledge base…
                </span>
              )}
            </div>
            <div className="space-y-2">
              {formatContent(message.content) || "No content"}
            </div>
          </div>
          {/* Actions */}
          {message.content && (
            <div className="flex justify-end items-center gap-3 mt-0 pt-0 text-muted-foreground">
              <button
                title="Like"
                onClick={() =>
                  handleFeedback(feedback === "like" ? null : "like")
                }
                className="p-2 rounded-full hover:bg-muted transition"
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    feedback === "like"
                      ? "text-white-600 fill-white"
                      : "text-muted-foreground"
                  }`}
                />
              </button>

              {/* Dislike */}
              <button
                title="Dislike"
                onClick={() =>
                  handleFeedback(feedback === "dislike" ? null : "dislike")
                }
                className="p-2 rounded-full hover:bg-muted transition"
              >
                <ThumbsDown
                  className={`h-4 w-4 ${
                    feedback === "dislike"
                      ? "text-red-600 fill-red-600"
                      : "text-muted-foreground"
                  }`}
                />
              </button>

              {/* Copy */}
              <button
                title="Copy"
                onClick={handleCopyContent}
                className="p-2 rounded-full hover:bg-muted transition"
              >
                <Copy className="h-4 w-4" />
              </button>

              {/* Download */}
              <button
                title="Download"
                onClick={handleDownloadContent}
                className="p-2 rounded-full hover:bg-muted transition"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {isRAG && message.sources && message.sources.length > 0 && (
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Knowledge Sources ({message.sources.length})
                </h4>
                {message.sources.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="text-xs h-7"
                  >
                    {showAllSources ? "Show Less" : "Show All"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {(showAllSources
                  ? message.sources
                  : message.sources.slice(0, 3)
                ).map((source, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-background/80 hover:bg-background transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary truncate">
                          {source.source}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {(source.score * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
