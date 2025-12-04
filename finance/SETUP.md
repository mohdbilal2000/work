# Setup Instructions

Follow these steps to get the Finance Portal up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
NODE_ENV="development"
```

## Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create and migrate database
npx prisma db push
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Access the Dashboard

Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the main dashboard.

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors about missing modules, make sure you've run `npm install` first.

### Database Errors
If you encounter database errors:
1. Delete the `prisma/dev.db` file (if it exists)
2. Run `npx prisma db push` again

### Port Already in Use
If port 3000 is already in use, Next.js will automatically use the next available port (3001, 3002, etc.)

## Next Steps

1. Start adding data through the various modules
2. Upload Vyapar files through the Day Book module
3. Customize the application to fit your specific needs

## Production Deployment

For production:
1. Change `DATABASE_URL` to use PostgreSQL or MySQL
2. Update `JWT_SECRET` to a secure random string
3. Set `NODE_ENV="production"`
4. Run `npm run build`
5. Run `npm start`

