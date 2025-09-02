import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function CreateThreadModal({ isOpen, onClose, categories }: CreateThreadModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createThreadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: number }) => {
      const res = await apiRequest("POST", "/api/threads", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all thread queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      // Also invalidate categories to update thread counts
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create thread",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) return;

    createThreadMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      categoryId: parseInt(categoryId),
    });
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategoryId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger data-testid="select-thread-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Thread Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a descriptive title for your thread..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="input-thread-title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="resize-none"
              data-testid="textarea-thread-content"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel-thread">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createThreadMutation.isPending || !title.trim() || !content.trim() || !categoryId}
              data-testid="button-submit-thread"
            >
              {createThreadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Thread
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
