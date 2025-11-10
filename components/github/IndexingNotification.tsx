'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface IndexingNotificationProps {
  repositoryId: string;
  repositoryName: string;
}

export const IndexingNotification: React.FC<IndexingNotificationProps> = ({
  repositoryId,
  repositoryName,
}) => {
  const { toast } = useToast();
  const [isIndexing, setIsIndexing] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string>('');

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8001/ws/${repositoryId}`;
    
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'indexing_progress') {
            const { status, indexed_files, total_files } = data;
            
            // Show notification when indexing completes
            if (previousStatus === 'IN_PROGRESS' && status === 'FULLY_INDEXED') {
              toast({
                title: 'Indexing Complete! ✅',
                description: `${repositoryName} has been fully indexed (${total_files} files)`,
                duration: 5000,
              });
              setIsIndexing(false);
            } else if (status === 'FAILED') {
              toast({
                title: 'Indexing Failed',
                description: `Failed to index ${repositoryName}`,
                variant: 'destructive',
                duration: 5000,
              });
              setIsIndexing(false);
            }
            
            setPreviousStatus(status);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [repositoryId, repositoryName, previousStatus, toast]);

  return null; // This component only shows notifications
};
