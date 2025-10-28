# Duolingo Clone

This project is a clone of Duolingo, built using modern web technologies. It features an admin dashboard and a local auth flow. Stripe and Clerk integrations have been removed.

## Features

- **Frontend**: Next.js, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: (previously Drizzle + Neon). Moving to Supabase (PostgreSQL).
- **State Management**: Zustand
- **HTTP Requests**: Axios
- **Admin Dashboard**: `react-admin`
- Payments: Removed (no Stripe)
- Authentication: Local username/password (Google SSO removed)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RikhiSingh/Duolingo-Clone.git
   cd Duolingo-Clone
   
2. **Install Dependencies**
   ```bash
   npm install
   
3. **Set up environment variables** <br/>
   Create a .env file in the root directory and add the necessary environment variables:
   ```bash
   DATABASE_URL        # Supabase Postgres connection string
   JWT_SECRET          # for local JWT auth
   NEXT_PUBLIC_APP_URL

4. **Run the development server**
   ```bash
   npm run dev

5. **Access the Application** <br />
   Open http://localhost:3000 in your browser.

## License
This project is licensed under the MIT License.

```Note: I chose the MIT License because it is a permissive open source license that allows others to freely use, modify, and distribute the code with minimal restrictions.```

## Usage
- Register or log in using local username/password.
- Explore language courses and track your progress.
- Admins can manage content through the admin dashboard.
- Subscription/premium is disabled (no Stripe).

## Supabase database

Because PostgreSQL enums cannot be used in the same transaction where a new value is added, you must run the setup in two steps:

1) In the Supabase SQL editor, run `scripts/supabase.step1-enum.sql` first. This creates the enum type `"type"` and adds the new value `SELECT_ALL`.

2) After Step 1 completes, run `supabase.sql` to create tables and seed data (courses, units, lessons, challenges, store items, and daily login rewards).

Troubleshooting: If you see error `55P04: unsafe use of new value "SELECT_ALL" of enum type type`, it means Step 1 and the inserts ran in the same transaction. Run Step 1 separately, then run `supabase.sql`.
  
## Contributing <br />
Contributions are welcome! Please follow these steps: <br />

1. Fork the repository.
2. Create a new branch.
3. Make your changes and commit them.
4. Push to your branch.
5. Open a pull request.
