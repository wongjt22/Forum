import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ReplyFormProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

export default function ReplyForm({ onSubmit, isSubmitting }: ReplyFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSubmit(content.trim());
    setContent("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reply to Thread</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply-content">Your Reply</Label>
            <Textarea
              id="reply-content"
              rows={6}
              placeholder="Write your reply here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="resize-none"
              data-testid="textarea-reply-content"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              data-testid="button-submit-reply"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Reply
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
