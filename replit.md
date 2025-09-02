# Overview

DevForum is a full-stack web application built as a developer community forum platform. It enables users to create accounts, post threads, reply to discussions, and organize content by categories. The application follows a modern TypeScript-based architecture with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Session-based auth with protected routes
- **UI Components**: Comprehensive set of Radix UI primitives with custom styling

The frontend is organized into pages, components, and hooks with clear separation of concerns. It uses a protected route system where unauthenticated users are redirected to the auth page.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Scrypt-based password hashing with salt
- **API Design**: RESTful endpoints following conventional patterns
- **Development**: Hot reload with Vite integration in development mode

The backend implements a storage abstraction layer that separates business logic from database operations, making it easier to test and maintain.

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Migration**: Drizzle Kit for schema migrations and database push operations

The database schema includes users, categories, threads, and posts tables with proper foreign key relationships and automatic UUID generation.

## Key Features Architecture
- **Forum Structure**: Categories contain multiple threads, threads contain multiple posts
- **User Management**: Registration, login, logout with session persistence
- **Thread Operations**: Create, view, reply with view count tracking
- **Search and Filtering**: Thread filtering by category and search terms
- **Real-time Updates**: Optimistic updates with React Query invalidation

## Build and Deployment
- **Development**: Concurrent frontend and backend development with Vite
- **Production Build**: Frontend builds to static assets, backend bundles with esbuild
- **TypeScript**: Strict type checking across the entire application
- **Asset Handling**: Vite handles frontend assets, Express serves static files in production

# External Dependencies

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management
- **WebSocket Support**: Neon serverless with ws library for real-time connections

## Authentication and Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with PostgreSQL store
- **Crypto (Node.js)**: Built-in scrypt for password hashing

## Frontend Libraries
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod validation
- **Wouter**: Lightweight routing library
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind

## UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Class Variance Authority**: Type-safe variant API for components
- **Tailwind Merge**: Utility for merging Tailwind classes
- **Date-fns**: Date manipulation and formatting