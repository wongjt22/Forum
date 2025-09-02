import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import ReplyForm from "@/components/reply-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, MessageSquare, Pin, Lock } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ThreadWithAuthorAndCategory, PostWithAuthor } from "@shared/schema";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadWithAuthorAndCategory>({
    queryKey: ["/api/threads", id],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/threads", id, "posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/threads/${id}/posts`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", id, "posts"] });
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="mb-6">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Thread not found</h1>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </Link>

        {/* Thread header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {getAvatarInitials(thread.author.username)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground" data-testid="text-thread-title">
                    {thread.title}
                  </h1>
                  {thread.isPinned && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Pin className="mr-1 h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  {thread.isLocked && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span data-testid="text-thread-author">by {thread.author.username}</span>
                  <span>•</span>
                  <span data-testid="text-thread-date">{formatDate(thread.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    {thread.viewCount} views
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    {thread.replyCount} replies
                  </span>
                </div>
                
                <Badge variant="outline" className="mb-4">
                  {thread.category.name}
                </Badge>
                
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-wrap" data-testid="text-thread-content">
                    {thread.content}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Replies ({posts.length})</h2>
          
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No replies yet. Be the first to reply!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {getAvatarInitials(post.author.username)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-foreground" data-testid={`text-post-author-${post.id}`}>
                          {post.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground" data-testid={`text-post-date-${post.id}`}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      
                      <div className="prose max-w-none">
                        <p className="text-foreground whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reply form */}
        {!thread.isLocked && (
          <ReplyForm
            onSubmit={(content) => createPostMutation.mutate(content)}
            isSubmitting={createPostMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
