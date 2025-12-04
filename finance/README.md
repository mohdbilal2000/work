# Finance Portal

A comprehensive finance management portal with multiple modules for managing receivables, expenses, payroll, compliance, sales, cash flow, and day book entries.

## Features

### 1. Receivable Management
- Track invoices and customer payments
- Monitor payment status (pending, partial, paid, overdue)
- View outstanding amounts

### 2. Expense Management
- Record and categorize expenses
- Track expense approvals
- Monitor total expenses

### 3. Payroll Accuracy & Disclosure
- Manage employee payroll records
- Track disclosure status
- Calculate net salary with allowances and deductions

### 4. Compliance Challans Accuracy
- Manage ESIC, PF, and TDS challans
- Track payment status and due dates
- Mark accuracy status for each challan

### 5. Daily Sales Outstanding
- Record daily sales
- Calculate days outstanding
- Track payment status

### 6. Net Cash Flow
- Track cash inflows and outflows
- Calculate running balance
- Monitor net cash flow

### 7. Day Book
- Manual entry of daily transactions
- Upload Vyapar export files (Excel/CSV)
- Track income and expenses

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **File Processing**: XLSX (for Vyapar imports)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Create a `.env` file in the root directory:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
NODE_ENV="development"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
finance-portal/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static files
```

## Database Schema

The application uses Prisma with SQLite. Key models include:
- User
- Receivable
- Expense
- Payroll
- ComplianceChallan
- DailySales
- CashFlow
- DayBook

## API Endpoints

- `GET/POST /api/receivables` - Receivables management
- `GET/POST /api/expenses` - Expenses management
- `GET/POST /api/payroll` - Payroll management
- `GET/POST /api/compliance` - Compliance challans
- `GET/POST /api/sales` - Sales records
- `GET/POST /api/cashflow` - Cash flow entries
- `GET/POST /api/daybook` - Day book entries
- `POST /api/daybook/upload` - Upload Vyapar file

## Vyapar File Upload

The Day Book module supports importing transactions from Vyapar exports:
- Supported formats: Excel (.xlsx, .xls) and CSV
- Required columns: Date, Type, Category, Description, Amount
- Optional columns: Reference, Invoice Number

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`

## License

MIT

