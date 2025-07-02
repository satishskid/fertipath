# Fertility Pathway Planner (FertiPath)

A comprehensive web application designed to help individuals and couples navigate their fertility journey with personalized guidance, tracking tools, and educational resources.

## 🌟 Features

### Core Functionality
- **Personalized Fertility Assessment**: Interactive questionnaire to determine individual fertility profiles
- **Custom Pathway Generation**: AI-powered recommendations based on user responses
- **Progress Tracking**: Monitor your fertility journey with detailed progress indicators
- **Educational Resources**: Comprehensive library of fertility-related articles and guides
- **Appointment Scheduling**: Integrated calendar system for tracking medical appointments
- **Medication Reminders**: Smart notification system for fertility medications
- **Symptom Tracking**: Daily logging of fertility symptoms and patterns

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Data Persistence**: Secure local storage and database integration
- **Modern UI/UX**: Clean, intuitive interface with accessibility features
- **Progressive Web App**: Installable on mobile devices

## 🚀 Installation Instructions

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- PostgreSQL database (for production)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/satishskid/fertipath.git
   cd fertipath
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values (see Environment Variables section below)

4. **Database Setup**
   ```bash
   # For development with SQLite (default)
   npm run db:migrate
   
   # For PostgreSQL production setup
   npm run db:setup
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open Application**
   Navigate to `http://localhost:3000` in your browser

## 🔧 Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Fertility Pathway Planner"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fertipath_db"
# For development with SQLite (alternative)
# DATABASE_URL="file:./dev.db"

# Authentication (if implementing user accounts)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# External APIs (optional)
OPENAI_API_KEY="your-openai-key" # For AI-powered recommendations
GOOGLE_CALENDAR_API_KEY="your-google-api-key" # For calendar integration

# Analytics (optional)
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

## 📦 Database Configuration

### PostgreSQL Setup (Production)
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE fertipath_db;
   CREATE USER fertipath_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE fertipath_db TO fertipath_user;
   ```

2. Update your `DATABASE_URL` in `.env.local`

3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed # Optional: populate with sample data
   ```

### SQLite Setup (Development)
For local development, SQLite is configured by default. No additional setup required.

## 🌐 Deployment Guidelines

### Option 1: Vercel (Recommended for Next.js)
1. **Connect Repository**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

2. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL service
   - Update `DATABASE_URL` in Vercel environment variables

3. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure DNS records with your domain provider

### Option 2: Netlify
1. **Build Configuration**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   out
   ```

2. **Environment Variables**
   - Configure in Netlify dashboard under Site Settings > Environment Variables

### Option 3: Self-Hosted (VPS/Cloud)
1. **Server Requirements**
   - Ubuntu 20.04+ or similar Linux distribution
   - Node.js 18+, PostgreSQL, Nginx
   - SSL certificate (Let's Encrypt recommended)

2. **Deployment Steps**
   ```bash
   # Clone and setup
   git clone https://github.com/satishskid/fertipath.git
   cd fertipath
   npm install
   npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start npm --name "fertipath" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 4: Docker Deployment
1. **Build Docker Image**
   ```bash
   docker build -t fertipath .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name fertipath-app \
     -p 3000:3000 \
     --env-file .env.production \
     fertipath
   ```

3. **Docker Compose (with PostgreSQL)**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/fertipath
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         POSTGRES_DB: fertipath
         POSTGRES_PASSWORD: password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

## 🔗 Domain Management

### DNS Configuration
1. **A Record**: Point your domain to your server's IP address
2. **CNAME Record**: Point `www` subdomain to your main domain
3. **SSL Certificate**: Use Let's Encrypt or your hosting provider's SSL

### Custom Domain Setup
```bash
# For Vercel
vercel domains add yourdomain.com

# For manual SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔌 API Configuration

### External Integrations
- **OpenAI API**: For AI-powered fertility recommendations
- **Google Calendar API**: For appointment scheduling
- **SendGrid/Mailgun**: For email notifications
- **Twilio**: For SMS reminders (optional)

### API Rate Limits
- Implement rate limiting for public endpoints
- Use Redis for session management in production
- Configure CORS for frontend-backend communication

## 📱 Progressive Web App (PWA)

The application includes PWA capabilities:
- Offline functionality for core features
- Installable on mobile devices
- Push notifications for reminders
- Background sync for data updates

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@fertipath.com
- Documentation: [docs.fertipath.com](https://docs.fertipath.com)

## 🙏 Acknowledgments

- Built with Next.js, React, and Tailwind CSS
- Icons by Heroicons and Lucide React
- Fertility data and guidelines from medical professionals
- Community feedback and contributions

---

**Note**: This application provides educational information and tools to support fertility planning. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding fertility concerns.