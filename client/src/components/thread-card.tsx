import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, Lock, Eye, MessageSquare } from "lucide-react";
import type { ThreadWithAuthorAndCategory } from "@shared/schema";

interface ThreadCardProps {
  thread: ThreadWithAuthorAndCategory;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  const formatDate = (date: string | Date) => {
    const now = new Date();
    const threadDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    
    return threadDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: threadDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const isNew = () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(thread.createdAt) > threeDaysAgo;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isNew() ? 'border-l-4 border-l-green-500' : ''}`} data-testid={`thread-card-${thread.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center space-y-1 min-w-0">
            {thread.isPinned ? (
              <Pin className="text-yellow-500 w-5 h-5" />
            ) : thread.category.name === "Help & Support" ? (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">?</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">•</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {thread.isPinned ? "Pinned" : isNew() ? "New" : ""}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1" data-testid={`text-thread-title-${thread.id}`}>
                {thread.title}
              </h3>
              
              <div className="flex items-center space-x-1">
                {thread.isPinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pinned
                  </Badge>
                )}
                {thread.isLocked && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <Lock className="mr-1 h-3 w-3" />
                    Locked
                  </Badge>
                )}
                {isNew() && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    New
                  </Badge>
                )}
                <Badge variant="outline">{thread.category.name}</Badge>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-thread-content-${thread.id}`}>
              {thread.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                    {getAvatarInitials(thread.author.username)}
                  </div>
                  <span data-testid={`text-thread-author-${thread.id}`}>{thread.author.username}</span>
                </div>
                <span>•</span>
                <span data-testid={`text-thread-date-${thread.id}`}>{formatDate(thread.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span data-testid={`text-thread-replies-${thread.id}`}>{thread.replyCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span data-testid={`text-thread-views-${thread.id}`}>{thread.viewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
