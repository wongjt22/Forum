import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ThreadList from "@/components/thread-list";
import CreateThreadModal from "@/components/create-thread-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import type { ThreadWithAuthorAndCategory, Category } from "@shared/schema";

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: threads = [], isLoading } = useQuery<ThreadWithAuthorAndCategory[]>({
    queryKey: ["/api/threads", selectedCategory, sortBy, searchTerm],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateThread={() => setIsCreateModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Sidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          
          <main className="lg:col-span-3">
            {/* Breadcrumb and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 sm:mb-0">
                <span className="text-foreground">
                  {selectedCategory ? 
                    categories.find(c => c.id.toString() === selectedCategory)?.name || "Home" : 
                    "Home"
                  }
                </span>
              </nav>
              
              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Sort by Latest</SelectItem>
                    <SelectItem value="most-replies">Most Replies</SelectItem>
                    <SelectItem value="most-views">Most Views</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="font-medium"
                  data-testid="button-create-thread"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Thread
                </Button>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search threads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </form>

            <ThreadList threads={threads} isLoading={isLoading} />
          </main>
        </div>
      </div>

      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
      />
    </div>
  );
}
