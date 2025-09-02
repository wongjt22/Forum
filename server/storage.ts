import { 
  users, 
  threads, 
  posts, 
  categories,
  type User, 
  type InsertUser,
  type Thread,
  type InsertThread,
  type ThreadWithAuthorAndCategory,
  type Post,
  type InsertPost,
  type PostWithAuthor,
  type Category,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  getThreads(categoryId?: number, sortBy?: string, search?: string): Promise<ThreadWithAuthorAndCategory[]>;
  getThread(id: string): Promise<ThreadWithAuthorAndCategory | undefined>;
  createThread(thread: InsertThread & { authorId: string }): Promise<Thread>;
  incrementThreadViews(id: string): Promise<void>;
  
  getPostsByThread(threadId: string): Promise<PostWithAuthor[]>;
  createPost(post: InsertPost & { authorId: string }): Promise<Post>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getThreads(categoryId?: number, sortBy?: string, search?: string): Promise<ThreadWithAuthorAndCategory[]> {
    let query = db
      .select({
        id: threads.id,
        title: threads.title,
        content: threads.content,
        authorId: threads.authorId,
        categoryId: threads.categoryId,
        isPinned: threads.isPinned,
        isLocked: threads.isLocked,
        viewCount: threads.viewCount,
        replyCount: threads.replyCount,
        createdAt: threads.createdAt,
        updatedAt: threads.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          createdAt: users.createdAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          threadCount: categories.threadCount,
        },
      })
      .from(threads)
      .innerJoin(users, eq(threads.authorId, users.id))
      .innerJoin(categories, eq(threads.categoryId, categories.id));

    let whereConditions = [];
    if (categoryId) {
      whereConditions.push(eq(threads.categoryId, categoryId));
    }
    if (search) {
      whereConditions.push(ilike(threads.title, `%${search}%`));
    }
    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    switch (sortBy) {
      case 'oldest':
        query = query.orderBy(desc(threads.isPinned), asc(threads.createdAt));
        break;
      case 'most-replies':
        query = query.orderBy(desc(threads.isPinned), desc(threads.replyCount));
        break;
      case 'most-views':
        query = query.orderBy(desc(threads.isPinned), desc(threads.viewCount));
        break;
      default:
        query = query.orderBy(desc(threads.isPinned), desc(threads.updatedAt));
    }

    return await query;
  }

  async getThread(id: string): Promise<ThreadWithAuthorAndCategory | undefined> {
    const [thread] = await db
      .select({
        id: threads.id,
        title: threads.title,
        content: threads.content,
        authorId: threads.authorId,
        categoryId: threads.categoryId,
        isPinned: threads.isPinned,
        isLocked: threads.isLocked,
        viewCount: threads.viewCount,
        replyCount: threads.replyCount,
        createdAt: threads.createdAt,
        updatedAt: threads.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          createdAt: users.createdAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
          threadCount: categories.threadCount,
        },
      })
      .from(threads)
      .innerJoin(users, eq(threads.authorId, users.id))
      .innerJoin(categories, eq(threads.categoryId, categories.id))
      .where(eq(threads.id, id));

    return thread || undefined;
  }

  async createThread(thread: InsertThread & { authorId: string }): Promise<Thread> {
    const [newThread] = await db
      .insert(threads)
      .values(thread)
      .returning();

    // Update category thread count
    await db
      .update(categories)
      .set({ 
        threadCount: sql`${categories.threadCount} + 1`
      })
      .where(eq(categories.id, thread.categoryId));

    return newThread;
  }

  async incrementThreadViews(id: string): Promise<void> {
    await db
      .update(threads)
      .set({ 
        viewCount: sql`${threads.viewCount} + 1`
      })
      .where(eq(threads.id, id));
  }

  async getPostsByThread(threadId: string): Promise<PostWithAuthor[]> {
    return await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.authorId,
        threadId: posts.threadId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          createdAt: users.createdAt,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.threadId, threadId))
      .orderBy(asc(posts.createdAt));
  }

  async createPost(post: InsertPost & { authorId: string }): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();

    // Update thread reply count and updated timestamp
    await db
      .update(threads)
      .set({ 
        replyCount: sql`${threads.replyCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(threads.id, post.threadId));

    return newPost;
  }
}

export const storage = new DatabaseStorage();
