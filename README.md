<div align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:0f172a,100:1f2937&text=Food%20Delivery%20Platform&reversal=false&textBg=false&fontColor=ffffff&fontSize=44&animation=fadeIn&fontAlignY=40"
    alt="Food Delivery Platform Dark Logo"
    width="100%"
  />
</div>

<p align="center">
  Full-stack multi-role food delivery system powered by <b>Laravel</b> and <b>Next.js</b>.
</p>

<p align="center">
  <img alt="Laravel" src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-111827?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Laravel Sanctum" src="https://img.shields.io/badge/Auth-Sanctum-0f172a?style=for-the-badge&logo=laravel&logoColor=white" />
  <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge" />
</p>

## Overview

This repository contains a complete food delivery platform with:

- A Laravel 12 backend API with role-based access (Super Admin, Restaurant Owner, Driver, Customer).
- A Next.js 14 dashboard for operations and management.
- Realtime events for order updates and driver tracking (Laravel Reverb channels).
- Notification support (in-app notifications and optional Firebase Cloud Messaging).

## Main Features

- **Authentication & roles**: Sanctum token auth with role middleware protection.
- **Customer flow**: browse restaurants, view menu, place/cancel/track orders, manage addresses, apply promo codes.
- **Restaurant flow**: manage profile, categories, menu items, incoming orders, and earnings.
- **Driver flow**: receive assigned orders, update delivery status, share live location, track earnings.
- **Admin flow**: control users/restaurants/orders, assign drivers, manage promos, and review analytics.
- **Dashboard UX**: modern Next.js UI with dark mode toggle and role-based route protection.

## Tech Stack

- **Backend**: Laravel 12, Sanctum, Reverb, Eloquent ORM, Queue (database), Vite.
- **Frontend (Dashboard)**: Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand, Radix UI.
- **Database**: SQLite by default (can be switched to MySQL/PostgreSQL via `.env`).
- **Notifications**: In-app notifications + optional FCM integration.

## Project Structure

```text
food_delivery/
|- app/                           # Laravel app code
|- routes/api.php                 # API routes
|- database/migrations/           # Database schema
|- food-delivery-dashboard/       # Next.js dashboard (admin/owner/driver)
|- food_delivery_app/             # Flutter client app scaffold
|- composer.json                  # PHP dependencies and scripts
`- package.json                   # Vite dependencies for Laravel frontend assets
```

## Prerequisites

Install these first:

- PHP 8.2+
- Composer 2+
- Node.js 18+ and npm
- SQLite (default) or MySQL/PostgreSQL

## Quick Start (Windows / PowerShell)

### 1) Clone and open project

```powershell
git clone https://github.com/muneerhadi/food-delivery-platform.git
cd food-delivery-platform
```

### 2) Setup Laravel API

```powershell
composer install
if (!(Test-Path ".env")) { Copy-Item ".env.example" ".env" }
php artisan key:generate
if (!(Test-Path "database/database.sqlite")) { New-Item "database/database.sqlite" -ItemType File | Out-Null }
php artisan migrate
php artisan storage:link
npm install
```

### 3) Seed demo users and sample data (recommended)

```powershell
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=DemoDataSeeder
```

### 4) Run Laravel services

```powershell
composer run dev
```

This command starts:

- Laravel API server (`http://127.0.0.1:8000`)
- Queue listener
- Log stream
- Vite dev server for Laravel assets

If you need websocket broadcasting for realtime channels, run this in another terminal:

```powershell
php artisan reverb:start
```

### 5) Setup and run Next.js dashboard

Open a new terminal:

```powershell
cd food-delivery-dashboard
npm install
Copy-Item ".env.example" ".env.local" -Force
npm run dev
```

Dashboard runs at `http://localhost:3000` and login is at `http://localhost:3000/login`.

## Demo Accounts

Use these accounts after running seeders:

- Super Admin: `admin@foodapp.com` / `Admin@123456`
- Restaurant Owner: `owner@foodapp.com` / `Owner@123456`
- Driver: `driver@foodapp.com` / `Driver@123456`
- Customer: `customer@foodapp.com` / `Customer@123456`

## Environment Configuration

### Laravel (`.env`)

Important variables:

- `APP_URL=http://localhost`
- `DB_CONNECTION=sqlite` (default)
- `BROADCAST_CONNECTION=reverb`
- `QUEUE_CONNECTION=database`
- `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
- `FCM_ENABLED=false` (enable only when Firebase credentials are configured)

### Dashboard (`food-delivery-dashboard/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## Useful Commands

### Backend (Laravel)

```powershell
php artisan test
php artisan migrate:fresh --seed
php artisan queue:listen --tries=1 --timeout=0
php artisan pail
```

### Dashboard (Next.js)

```powershell
npm run dev
npm run build
npm run start
npm run lint
```

## API Route Groups

Main route groups available in `routes/api.php`:

- `/auth/*` for register/login/logout/me
- `/admin/*` for super admin operations
- `/restaurant/*` for restaurant owner actions
- `/driver/*` for driver operations
- `/restaurants`, `/orders`, `/addresses`, `/notifications` for customer features

## Troubleshooting

- If image URLs fail, run `php artisan storage:link`.
- If dashboard gets `401` errors, confirm token login and `NEXT_PUBLIC_API_URL`.
- If frontend cannot reach API, make sure Laravel is running on port `8000`.
- If realtime updates do not arrive, verify `reverb` settings and run `php artisan reverb:start`.

## License

This project is licensed under the [MIT License](./LICENSE).
