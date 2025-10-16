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
import { ChatMessage as ChatMessageType } from "@/types/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Highlight } from "prism-react-renderer";
import { apiService } from "@/lib/api";
// Import the enhanced message formatter
import { formatContent } from "@/components/MessageFormatter"; // Adjust path as needed
import { Textarea } from "./ui/textarea";

interface ChatMessageProps {
  message: ChatMessageType;
  onEditAndResend?: (id: string, newContent: string) => void;
}

export function ChatMessage({ message, onEditAndResend }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(
    message.feedback ?? null
  );

  const [showAllSources, setShowAllSources] = useState(false);
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());
  const isUser = message.role === "user";
  const isRAG = message.modelType === "rag";
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSaveEditedMessage = () => {
    if (editedContent.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    setIsEditing(false);
    console.log('message id:', message.id);
    console.log('edited content:', editedContent);
    onEditAndResend?.(message.id, editedContent); // ✅ call Dashboard handler
  };

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

  const handleFeedback = async (newFeedback: "like" | "dislike" | null) => {
    const prev = feedback;
    setFeedback(newFeedback);

    try {
      await apiService.updateFeedback(message.id, newFeedback);
      console.log("Feedback is updated!");
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

  // if (isUser) {
  //   return (
  //     <div className="flex justify-end space-x-3 mb-6">
  //       <div className="max-w-[80%] space-y-2">
  //         <div className="flex items-center justify-end space-x-2">
  //           <Badge variant="outline" className={modelColor}>
  //             <ModelIcon className="h-3 w-3 mr-1" />
  //             {modelLabel}
  //           </Badge>
  //           <span className="text-xs text-muted-foreground">
  //             {formatTimestamp(message.timestamp)}
  //           </span>
  //         </div>
  //         <div>
  //           {/* User message bubble */}
  //           <div className="bg-primary text-primary-foreground p-4 rounded-lg rounded-br-sm shadow-sm max-w-full">
  //             <p className="text-sm whitespace-pre-wrap break-words leading-relaxed ">
  //               {message.content}
  //             </p>
  //           </div>

  //           {/* Actions */}
  //           {message.content && (
  //             <div className="flex justify-end items-center gap-3 mt-0 pt-0 text-muted-foreground">
  //               {/* Copy */}
  //               <button
  //                 title="Copy"
  //                 onClick={handleCopyContent}
  //                 className="p-2 rounded-full hover:bg-muted transition"
  //               >
  //                 <Copy className="h-4 w-4" />
  //               </button>

  //               {/* Edit */}
  //               <button
  //                 title="Edit"
  //                 // onClick={handleEditMessage}
  //                 className="p-2 rounded-full hover:bg-muted transition"
  //               >
  //                 <Edit2 className="h-4 w-4" />
  //               </button>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (isUser) {
    return (
      <div className="flex justify-end space-x-3 mb-6 w-full">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-end space-x-2">
            <Badge variant="outline" className={modelColor}>
              <ModelIcon className="h-3 w-3 mr-1" />
              {modelLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* ✅ EDIT MODE */}
          {isEditing ? (
            <div className="w-full mt-2">
              <div className="bg-background/80 border border-muted rounded-3xl shadow-sm hover:shadow-md transition-shadow p-3 backdrop-blur-md max-w-full">
                <Textarea
                  placeholder="Edit your message..."
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[52px] max-h-[140px] w-full p-3 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm text-foreground"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
                  }}
                  autoFocus
                />

                {/* Buttons */}
                <div className="flex justify-end items-center p-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveEditedMessage}
                    className="rounded-full"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Normal compact user bubble */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-4 rounded-lg rounded-br-sm shadow-sm inline-block max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>

              {/* Copy + Edit buttons */}
              {message.content && (
                <div className="flex justify-end items-center gap-3 mt-0 pt-0 text-muted-foreground">
                  <button
                    title="Copy"
                    onClick={handleCopyContent}
                    className="p-2 rounded-full hover:bg-muted transition"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    title="Edit"
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-full hover:bg-muted transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
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
        </div>

        <div>
          <div className="bg-muted p-4 rounded-lg rounded-bl-sm border border-muted/40 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            {/* Loader / Thinking State */}
            <div className="flex items-center gap-2 mb-2">
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
              {/* Use the enhanced formatter here */}
              {formatContent(message.content, copiedBlocks, copyToClipboard) ||
                "No content"}
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
