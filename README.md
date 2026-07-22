# Shift Swap Platform

A web-based platform for psychiatry registrars to coordinate and manage shift swaps within their health network.

## Features

- **User Authentication**: Secure login/registration for registrars
- **Shift Swap Board**: Calendar grid view of all active shift swap requests
- **Swap Matching**: Automatic 2-way swap matching algorithm
- **In-App Messaging**: Direct messaging between registrars
- **Admin Dashboard**: Tools for managing registrars and monitoring swaps
- **Mobile Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, Axios, React Router
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT + Bcrypt

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm run install-all
```

### Setup Admin Account

```bash
cd server
npm run setup
```

### Start Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Admin Credentials

After running `npm run setup`:
- Email: arjun@psychiatry.health
- Password: AdminPassword123!

⚠️ **Change password after first login!**

## Deployment to Railway

See DEPLOYMENT_GUIDE.md for step-by-step instructions.

## Testing

See TESTING_GUIDE.md for comprehensive testing checklist.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### Swaps
- `GET /api/swaps/board` - Get all active swaps
- `POST /api/swaps/create` - Create new swap
- `GET /api/swaps/my-swaps` - Get user's swaps
- `DELETE /api/swaps/:swapId` - Delete swap
- `POST /api/swaps/accept-offer` - Accept swap offer

### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages/inbox` - Get inbox
- `GET /api/messages/conversation/:registrarId` - Get conversation

### Admin
- `GET /api/admin/registrars` - List all registrars
- `POST /api/admin/registrars/create` - Create registrar
- `DELETE /api/admin/registrars/:registrarId` - Delete registrar
- `GET /api/admin/swaps` - List all swaps
- `DELETE /api/admin/swaps/:swapId` - Delete swap

## Roster Period

August 3, 2026 - January 31, 2027

## License

Private - Psychiatry Registrar Network
