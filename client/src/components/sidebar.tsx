import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, HelpCircle } from "lucide-react";
import type { Category } from "@shared/schema";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  "fas fa-code": <Code className="w-4 h-4" />,
  "fab fa-js-square": <Code className="w-4 h-4" />,
  "fab fa-react": <Code className="w-4 h-4" />,
  "fab fa-node-js": <Code className="w-4 h-4" />,
  "fas fa-database": <Database className="w-4 h-4" />,
  "fas fa-question-circle": <HelpCircle className="w-4 h-4" />,
};

export default function Sidebar({ categories, selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <aside className="lg:col-span-1">
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === "" ? "default" : "ghost"}
            className="w-full justify-between"
            onClick={() => onCategorySelect("")}
            data-testid="button-category-all"
          >
            <span className="flex items-center">
              <Code className="mr-3 w-4 h-4" />
              All Categories
            </span>
            <Badge variant="secondary">
              {categories.reduce((sum, cat) => sum + cat.threadCount, 0)}
            </Badge>
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id.toString() ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={() => onCategorySelect(category.id.toString())}
              data-testid={`button-category-${category.slug}`}
            >
              <span className="flex items-center">
                {iconMap[category.icon] || <Code className="mr-3 w-4 h-4" />}
                <span className="ml-3">{category.name}</span>
              </span>
              <Badge variant="secondary">{category.threadCount}</Badge>
            </Button>
          ))}
        </CardContent>
        
        <CardContent className="border-t pt-6">
          <CardTitle className="text-sm mb-3">Forum Stats</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Threads</span>
              <span className="font-medium" data-testid="text-total-threads">
                {categories.reduce((sum, cat) => sum + cat.threadCount, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categories</span>
              <span className="font-medium" data-testid="text-total-categories">
                {categories.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
