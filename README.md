# FIRST CLIENT AI

"You have the skill. We'll help you turn it into your first client."

A modern SaaS web application that helps beginner freelancers turn an existing skill into a clear freelance service, choose a niche, create an offer, build portfolio ideas, generate outreach messages, and create client proposals.

## 1. Project Structure

The project uses Next.js 15 (App Router), Tailwind CSS 4, Prisma, and NextAuth.

```text
ideas/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes (auth, register, etc.)
│   │   ├── dashboard/       # Protected dashboard & tools
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── globals.css      # Global styles & theme tokens
│   │   ├── layout.tsx       # Root layout with SessionProvider
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable UI components
│   │   └── Providers.tsx    # NextAuth Provider wrapper
│   ├── lib/                 # Utility functions & configs
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── prisma.ts        # Prisma client singleton
│   └── middleware.ts        # Route protection middleware
├── .env                     # Environment variables
├── package.json             # Dependencies
└── tailwind.config.ts       # Tailwind configuration (if applicable)
```

## 2. Required Environment Variables

You need a `.env` file in the root of the project with the following variables:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/firstclientai?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-secret-key-here"

# AI Provider API Key
AI_API_KEY="your-ai-api-key-here"
```

## 3. Database Setup Instructions

1. Ensure you have a PostgreSQL database running locally or use a cloud provider like Supabase/Neon.
2. Update the `DATABASE_URL` in your `.env` file to match your database connection string.
3. Run Prisma migrations to set up the schema:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev --name init
   ```
4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

## 4. Local Development Instructions

1. Install all dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## 5. Production Deployment Instructions

1. Push your code to a GitHub repository.
2. Create a new project on Vercel (or similar hosting provider).
3. Connect your GitHub repository to Vercel.
4. Add the required Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AI_API_KEY`) in the Vercel project settings.
5. Deploy the project. Vercel automatically detects Next.js projects and sets up the correct build commands.
   - Build command: `npx prisma generate && next build`
   - Install command: `npm install`

## 6. List of Implemented Features

- **Modern SaaS Landing Page**: Designed with a premium dark/white aesthetic, clean typography, and a clear user journey visualization.
- **Authentication**: Fully functional secure registration and login using NextAuth with credentials (email/password encrypted via bcryptjs).
- **Database Schema**: Complete Prisma schema for User profiles, Onboarding data, Services, Niches, Offers, Portfolio Projects, Outreach Messages, and Proposals.
- **Protected Routing**: Middleware that secures the dashboard and onboarding routes.
- **Dashboard UI**: A comprehensive dashboard layout with a sidebar (mobile responsive), progress tracking, and navigation.
- **Skill -> Service Tool UI**: The first AI tool interface is fully built, featuring loading states and mock data generation to demonstrate the UI flow before connecting the real AI provider.

## 7. List of Remaining Placeholder Features

- **Real AI Integration**: The Service tool currently uses simulated mock responses. Needs to be connected to an AI API (e.g., OpenAI, Anthropic, Gemini) via the planned AI service layer.
- **Niche Finder Tool**: UI placeholder created, needs full implementation.
- **Offer Builder Tool**: UI placeholder created, needs full implementation.
- **Portfolio Builder Tool**: UI placeholder created, needs full implementation.
- **Outreach Generator Tool**: UI placeholder created, needs full implementation.
- **Proposal Generator Tool**: UI placeholder created, needs full implementation.
- **Onboarding Flow**: The multi-step onboarding process right after registration to populate the `Onboarding` model.
