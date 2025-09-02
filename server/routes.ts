import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertThreadSchema, insertPostSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Threads
  app.get("/api/threads", async (req, res) => {
    try {
      const { categoryId, sortBy, search } = req.query;
      const threads = await storage.getThreads(
        categoryId ? parseInt(categoryId as string) : undefined,
        sortBy as string,
        search as string
      );
      res.json(threads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threads" });
    }
  });

  app.get("/api/threads/:id", async (req, res) => {
    try {
      const thread = await storage.getThread(req.params.id);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      // Increment view count
      await storage.incrementThreadViews(req.params.id);
      
      res.json(thread);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thread" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validation = insertThreadSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid thread data" });
      }

      const thread = await storage.createThread({
        ...validation.data,
        authorId: req.user!.id,
      });

      res.status(201).json(thread);
    } catch (error) {
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  // Posts
  app.get("/api/threads/:threadId/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByThread(req.params.threadId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/threads/:threadId/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validation = insertPostSchema.safeParse({
        ...req.body,
        threadId: req.params.threadId,
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid post data" });
      }

      const post = await storage.createPost({
        ...validation.data,
        authorId: req.user!.id,
      });

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
