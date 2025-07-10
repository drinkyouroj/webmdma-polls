# WebMDMA Polls

A modern polling platform built with React, TypeScript, and Supabase backend. Create polls, vote, and see real-time results with beautiful visualizations.

## Features

- **User Authentication**: Secure sign-up, login, and profile management
- **Poll Creation**: Create polls with multiple options and customizable settings
- **Voting System**: Cast votes on polls with real-time updates
- **Results Visualization**: View poll results with interactive charts
- **Comments**: Discuss polls with other users
- **Real-time Updates**: See votes and comments as they happen
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Authentication, Realtime subscriptions)
- **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) with [React-Chartjs-2](https://github.com/reactchartjs/react-chartjs-2)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) account

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/webmdma-polls.git
cd webmdma-polls
```

2. **Install dependencies**

```bash
npm install
# or
yarn
```

3. **Set up Supabase**

- Create a new project in the [Supabase Dashboard](https://app.supabase.com/)
- Go to Project Settings > API to get your project URL and anon key
- Copy `.env.example` to `.env.local` and update with your Supabase credentials:

```bash
cp .env.example .env.local
```

4. **Apply database migrations**

- Navigate to the SQL editor in your Supabase dashboard
- Copy the contents of `supabase/migrations/00000000000000_initial_schema.sql`
- Run the SQL to set up your database schema

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**

Visit [http://localhost:5173](http://localhost:5173) to see the application.

## Project Structure

```
webmdma-polls/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and libraries
│   │   └── supabase/       # Supabase client and types
│   ├── pages/              # Page components
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── .env.example            # Example environment variables
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Development Workflow

1. **Create Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**

3. **Commit Changes**

```bash
git add .
git commit -m "Add your feature description"
```

4. **Push Changes**

```bash
git push origin feature/your-feature-name
```

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in the Netlify dashboard
3. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.