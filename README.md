# 📋 Task Whisper AI Planner

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.0-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-0.24.1-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.0.0-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Een intelligente taakplanner met AI-ondersteuning voor het beheren van taken, projecten en planning. Gebouwd met moderne webtechnologieën en geïntegreerd met Google's Generative AI voor slimme taakanalyse en herplanning.

## ✨ Features

### 🎯 **Taakbeheer**
- **Slimme taakcreatie** met prioriteit en inspanningsniveaus
- **AI-ondersteunde herplanning** van te late taken
- **Bulk-operaties** voor meerdere taken tegelijk
- **Status tracking** (pending, in-progress, completed, overdue)
- **Datum filtering** en zoekfunctionaliteit

### 🤖 **AI Integratie**
- **Automatische taakanalyse** via Google Gemini AI
- **Intelligente herplanning** op basis van prioriteiten
- **Bijlage analyse** voor bestanden, afbeeldingen en tekst
- **Dagelijkse taakcapaciteit** optimalisatie

### 📱 **Moderne UI/UX**
- **Responsive design** voor desktop en mobiel
- **Dark/Light mode** ondersteuning
- **Toegankelijke componenten** met shadcn/ui
- **Smooth animaties** en interacties
- **Mobile-first** navigatie

### 🔐 **Authenticatie & Beveiliging**
- **Supabase authenticatie** met email/wachtwoord
- **Beveiligde API routes** en data toegang
- **Gebruikersprofielen** en instellingen
- **Automatische sessiebeheer**

### 📊 **Project Management**
- **Project organisatie** met kleurcodering
- **Taak-project koppeling**
- **Project overzichten** en statistieken
- **Flexibele projectstructuur**

## 🚀 Quick Start

### Vereisten
- Node.js 18+ 
- npm of yarn
- Supabase account
- Google AI API key

### Installatie

```bash
# 1. Clone de repository
git clone <repository-url>
cd task-whisper-ai-planner

# 2. Installeer dependencies
npm install

# 3. Configureer environment variables
cp .env.example .env.local
```

### Environment Variables

Maak een `.env.local` bestand aan met de volgende variabelen:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Database Setup

1. Maak een Supabase project aan
2. Voer de migraties uit uit de `supabase/migrations` folder
3. Configureer Row Level Security (RLS) policies

### Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in je browser
```

### Build voor Productie

```bash
# Build de applicatie
npm run build

# Preview de build
npm run preview
```

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool en dev server
- **React Router** - Client-side routing
- **React Query** - Server state management

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

### AI & Integrations
- **Google Generative AI** - AI-powered features
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting

## 📁 Project Structuur

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
├── config/             # Configuration files
└── integrations/       # Third-party integrations
```

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) voor de geweldige component library
- [Supabase](https://supabase.com/) voor de backend services
- [Google AI](https://ai.google.dev/) voor de AI integratie
- [Tailwind CSS](https://tailwindcss.com/) voor de styling utilities

## 📞 Support

Voor vragen of ondersteuning, neem contact op via:
- Email: [your-email@example.com]
- GitHub Issues: [Project Issues](https://github.com/your-username/task-whisper-ai-planner/issues)

---

**Gemaakt met ❤️ en ☕ door [Jouw Naam]**
