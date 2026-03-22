# Local Setup Guide (Linux Mint)

A step-by-step guide to run this project on a fresh Linux Mint machine. No prior experience with this project is needed.

---

## Prerequisites

You need to install two things: **Node.js** (v18 or newer) and **PostgreSQL** (v14 or newer).

### 1. Install Node.js 18+

Open a terminal and run these commands one by one:

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify it installed correctly:

```bash
node -v
# Should print v18.x.x or higher

npm -v
# Should print 9.x.x or higher
```

### 2. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

Make sure PostgreSQL is running:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify:

```bash
sudo systemctl status postgresql
# Should say "active (running)"
```

### 3. Install Git (if not already installed)

```bash
sudo apt install -y git
```

---

## Project Setup

### 4. Clone the repository

```bash
git clone https://github.com/Zofraire/student-projects.git
cd student-projects
```

Switch to the branch with Mongolian localization:

```bash
git checkout claude/add-mongolian-localization-w56Ue
```

### 5. Create the PostgreSQL database and user

Open the PostgreSQL prompt:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt, run these commands (copy-paste them one at a time):

```sql
CREATE USER myuser WITH PASSWORD 'student@123';
CREATE DATABASE student_projects OWNER myuser;
GRANT ALL PRIVILEGES ON DATABASE student_projects TO myuser;
\q
```

The `\q` command exits the PostgreSQL prompt.

### 6. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Now open `.env` in a text editor (e.g., `nano .env` or `xed .env`) and replace the contents with:

```
DATABASE_URL="postgresql://myuser:student@123@localhost:5432/student_projects"
NEXTAUTH_SECRET="fe3cc338af3c1744d1e48894bd8a9e855e468af47d67db5a095497180d761a12"
NEXTAUTH_URL="http://localhost:3000"
```

Save and close the file.

**What each variable means:**
- `DATABASE_URL` — Connection string to your local PostgreSQL database
- `NEXTAUTH_SECRET` — A secret key used to encrypt authentication sessions
- `NEXTAUTH_URL` — The URL where the app will run locally

### 7. Install project dependencies

```bash
npm install
```

This will download all required packages and also automatically generate the Prisma database client.

### 8. Initialize the database

Push the database schema to PostgreSQL:

```bash
npx prisma db push
```

### 9. Seed the database (creates the admin account)

```bash
npx prisma db seed
```

You should see: `Admin user created!`

### 10. Start the development server

```bash
npm run dev
```

The server will start. Open your browser and go to:

```
http://localhost:3000
```

You will be redirected to `http://localhost:3000/en` (English version).

---

## Admin Login

Go to the sign-in page:

```
http://localhost:3000/en/auth/signin
```

Use these credentials:

| Field    | Value               |
|----------|---------------------|
| Email    | admin@example.com   |
| Password | admin123            |

After signing in, you can access the admin dashboard from the navigation menu.

---

## Testing Mongolian Localization

To see the Mongolian version of the site, visit:

```
http://localhost:3000/mn
```

All UI text (navigation, buttons, labels, etc.) should appear in Mongolian. You can navigate through:

- Home page: `http://localhost:3000/mn`
- Projects: `http://localhost:3000/mn/projects`
- Sign in: `http://localhost:3000/mn/auth/signin`

---

## Troubleshooting

### "Connection refused" or database errors

PostgreSQL might not be running. Start it:

```bash
sudo systemctl start postgresql
```

### "Role myuser does not exist"

You skipped step 5. Go back and create the database user.

### "Port 3000 is already in use"

Something else is using port 3000. Either stop that process or run the dev server on a different port:

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001` instead.

### "Node.js version too old"

Check your version with `node -v`. You need v18 or higher. If it's older, re-run the Node.js installation commands from step 1.

### "prisma: command not found"

Run `npm install` again. Prisma is installed as a project dependency.

### npm install fails with permission errors

Do NOT use `sudo npm install`. Instead, fix npm permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Then run `npm install` again.
