# WiFacture Design System & Coding Guidelines

This document outlines the visual system, typography, colors, animations, and component guidelines for the WiFacture application. All developers and agents must adhere to these guidelines to maintain visual coherence across all pages.

## 1. Visual Aesthetics & Theme
- **Tone**: High-end SaaS, professional, reliable, premium, yet accessible to African entrepreneurs.
- **Typography**: `Inter` is the primary font family. Use weights `400` (Regular), `500` (Medium), `600` (Semi-Bold), and `700` (Bold).
- **Core Layout**: Sidebar on desktop (left-aligned, 256px wide), topbar with breadcrumbs and actions, main container with standard padding (`px-4 sm:px-6 lg:px-8 py-8`).

## 2. Color Palette
- **Primary Color**: Sky Blue / Light Blue (`#38bdf8` or `bg-sky-400`/`text-sky-500`) for navigation highlights and brand elements.
- **Brand Logo Accent**: Use the official logo (`https://res.cloudinary.com/dwp4isflu/image/upload/v1783543056/logo_anime_1_yqs3cu.png`).
- **Status Colors**:
  - **Payée (Paid)**: Green (`bg-green-100 text-green-700` / Progress bar: `bg-green-500`)
  - **Envoyée (Sent)**: Orange/Amber (`bg-orange-100 text-orange-700` / Progress bar: `bg-orange-500` or `bg-amber-500`)
  - **Brouillon (Draft)**: Gray (`bg-gray-100 text-gray-700`)
  - **En Retard (Overdue)**: Red (`bg-red-100 text-red-700` / Progress bar: `bg-red-500`)
  - **Dû (Due)**: Yellow/Amber for overall stats overview (`bg-yellow-400` for indicator).

## 3. Micro-Animations & Interactivity
- **Buttons / Actions**: Always apply hover transitions.
  - Base class: `transition-all duration-200 ease-in-out`
  - Hover: `hover:opacity-90 hover:shadow-sm` or slight background shifts.
  - Active: `active:scale-98` or `active:scale-95` for tactile click feedback.
- **Sidebar Links**: Use transition on hover/active states. Translate slight movement on hover if appropriate or simple color transitions (`transition-colors duration-150`).
- **Cards**: Add subtle shadows (`shadow-sm`) and hover elevation if interactive (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`).

## 4. Responsiveness
- **Desktop (>= md / 768px)**: Persistent sidebar.
- **Mobile (< md / 768px)**: Hidden sidebar by default, accessible via a slide-over mobile drawer or absolute toggle menu triggered by a hamburger button in the Topbar.
- **Tables**: Wrap all tabular data in an `overflow-x-auto` wrapper to allow horizontal scrolling on smaller viewports.
- **Stats**: Stack statistics vertically on mobile (`grid-cols-1`) and switch to horizontal layout on larger screens (`md:grid-cols-3` or `md:grid-cols-4`).

## 5. Coding Principles
- **FCFA Currency**: Display all monetary values using `formatCurrency` helper in `src/lib/utils.ts`. Must show suffix `FCFA` (e.g., `250 000 FCFA`), never use fractional decimals since FCFA doesn't have centimes.
- **Dates**: Display dates in DD/MM/YYYY format using `formatDate` helper in `src/lib/utils.ts`.
- **Zod Schemas**: Always validate data client-side and server-side.
