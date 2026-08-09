# TrackFlow — Frontend

The React + TypeScript frontend for TrackFlow, an AI-powered personal finance tracker. Provides a dashboard for tracking income and expenses, managing budgets and goals, and chatting with an AI financial assistant.

**Live app:** https://gettrackflow-ai.vercel.app
**Backend repo:** [link to your backend repo]
**Backend API:** https://trackflow-backend-483d.onrender.com

## Features

- Dashboard with real-time income/expense/balance overview
- Transaction management (add, view, delete income & expenses)
- Budget and goal tracking
- AI-powered financial insights and natural-language Q&A
- Analytics view for spending patterns
- JWT-based authentication

## Tech Stack

- **Framework:** React + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- The [TrackFlow backend](link-to-backend-repo) running locally or deployed

### Setup

```bash
# Clone the repo
git clone https://github.com/Konlan21/<frontend-repo-name>.git
cd <frontend-repo-name>

# Install dependencies
npm install
```

### Environment variables

Create a `.env` file in the project root:
VITE_API_BASE_URL=http://127.0.0.1:8000

For production, point this at the deployed backend URL instead.

### Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```