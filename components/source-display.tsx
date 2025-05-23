import { DocumentSource } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface SourceDisplayProps {
  sources: DocumentSource[];
}

export function SourceDisplay({ sources }: SourceDisplayProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Sources:</h4>
      <div className="space-y-2">
        {sources.map((source, index) => (
          <Card key={index} className="border-l-4 border-l-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{source.source}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(source.score * 100)}% match
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {source.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}