# Tailwind CSS Configuration - FIFA World Cup 2026 Theme

## Overview

This project uses **Tailwind CSS v4** with a custom FIFA World Cup 2026 dark theme. Configuration is done via CSS using the `@theme inline` directive in `app/globals.css` rather than a traditional `tailwind.config.ts` file.

## Task Implementation: Task 1.3

This configuration implements:
- ✅ Custom FIFA color palette (Crimson, Gold, Deep Slate, Surface)
- ✅ Dark mode with `class` strategy (configured via `@custom-variant dark`)
- ✅ Responsive breakpoints including 320px minimum for mobile
- ✅ Overflow prevention utilities
- ✅ Requirements: 14 (Dark Mode UI Theme), 22 (Responsive Layout)

## Custom Color Palette

### FIFA Colors

#### Primary: FIFA Crimson
- **Hex**: `#C8102E`
- **Usage**: Call-to-action buttons, active states, important actions
- **Tailwind classes**: `bg-primary`, `text-primary`, `border-primary`
- **CSS variable**: `--color-fifa-crimson`

```jsx
<button className="bg-primary text-primary-foreground">
  Submit Prediction
</button>
```

#### Accent: Tournament Gold
- **Hex**: `#FFD700`
- **Usage**: Borders, highlights, secondary emphasis
- **Tailwind classes**: `bg-accent`, `text-accent`, `border-accent`
- **CSS variable**: `--color-tournament-gold`

```jsx
<div className="border-2 border-accent">
  Live Match Banner
</div>
```

#### Background: Deep Slate
- **Hex**: `#0A0A0F`
- **Usage**: Main page background
- **Tailwind classes**: `bg-background`, `bg-deep-slate`
- **CSS variable**: `--color-deep-slate`

```jsx
<div className="bg-background min-h-screen">
  Page Content
</div>
```

#### Surface: Card Background
- **Hex**: `#13131A`
- **Usage**: Card backgrounds, elevated surfaces
- **Tailwind classes**: `bg-card`, `bg-surface`
- **CSS variable**: `--color-surface`

```jsx
<div className="bg-card p-6 rounded-lg">
  Match Card
</div>
```

## Dark Mode Configuration

### Strategy: Class-Based

The project uses the `class` strategy for dark mode via `next-themes`:

```jsx
// app/layout.tsx
<ThemeProvider 
  attribute="class" 
  defaultTheme="dark" 
  enableSystem={false}
>
```

The `.dark` class is applied to the `<html>` element, activating all dark mode styles.

### CSS Configuration

```css
/* app/globals.css */
@custom-variant dark (&:is(.dark *));
```

This enables the `dark:` variant in all Tailwind utilities:

```jsx
<div className="bg-white dark:bg-surface text-black dark:text-foreground">
  Responsive to theme
</div>
```

## Responsive Breakpoints

### Breakpoint Values

| Breakpoint | Min Width | Device Type | Tailwind Prefix |
|------------|-----------|-------------|-----------------|
| `xs` | 320px | Mobile (minimum) | (default) |
| `sm` | 640px | Small devices (landscape phones) | `sm:` |
| `md` | 768px | Tablets | `md:` |
| `lg` | 1024px | Desktops | `lg:` |
| `xl` | 1280px | Large desktops | `xl:` |
| `2xl` | 1536px | Extra large desktops | `2xl:` |

### Usage Examples

```jsx
{/* Single column on mobile, 2 on tablet, 3 on desktop, 4 on large */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>

{/* Responsive padding */}
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>

{/* Hide on mobile, show on tablet+ */}
<div className="hidden md:block">
  Desktop Navigation
</div>
```

### Mobile-First Design

The project enforces a **320px minimum width** on the `<body>` element to ensure proper mobile display:

```css
body {
  min-width: 320px;
}
```

## Overflow Prevention Utilities

### Built-in Utilities

#### `.overflow-prevention`
Prevents horizontal overflow on containers.

```jsx
<div className="overflow-prevention">
  Content that won't cause horizontal scroll
</div>
```

**Equivalent to**: `overflow-hidden max-w-full`

#### `.container-safe`
Safe container with overflow protection.

```jsx
<div className="container-safe mx-auto">
  Centered content container
</div>
```

**Equivalent to**: `max-w-full overflow-x-hidden`

#### `.w-screen-safe`
Full viewport width without overflow.

```jsx
<div className="w-screen-safe">
  Full width banner
</div>
```

**Equivalent to**: `width: 100vw; max-width: 100%;`

### Global Overflow Protection

All pages have automatic overflow protection:

```css
html, body {
  overflow-x-hidden;
  max-width: 100vw;
}
```

## Accessibility (WCAG AA)

The dark theme ensures **high contrast** for text readability:

- **Foreground text**: `oklch(0.985 0 0)` (near-white)
- **Background**: `#0A0A0F` (deep slate)
- **Contrast ratio**: > 4.5:1 (WCAG AA compliant)

### Focus States

Focus rings use Tournament Gold for visibility:

```css
--ring: #FFD700; /* Tournament Gold */
```

All interactive elements automatically receive visible focus indicators:

```jsx
<button className="focus:outline-ring focus:ring-2">
  Accessible Button
</button>
```

## Component Examples

### Match Card

```jsx
<div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
  <h3 className="text-foreground font-semibold mb-2">
    Argentina vs Brazil
  </h3>
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">Group A</span>
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
      Predict
    </button>
  </div>
</div>
```

### Live Match Banner

```jsx
<div className="bg-surface border-b border-accent sticky top-0 z-50 overflow-hidden">
  <div className="container-safe mx-auto px-4 py-3">
    <div className="flex items-center space-x-2">
      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold">
        LIVE
      </span>
      <span className="text-foreground font-semibold">
        France 2 - 1 Spain
      </span>
    </div>
  </div>
</div>
```

### Responsive Grid

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-prevention">
  {matches.map(match => (
    <MatchCard key={match.id} match={match} />
  ))}
</div>
```

## CSS Variables Reference

### Color Variables

```css
/* Custom FIFA Colors */
--color-fifa-crimson: #C8102E;
--color-tournament-gold: #FFD700;
--color-deep-slate: #0A0A0F;
--color-surface: #13131A;

/* Semantic Colors (in .dark class) */
--background: #0A0A0F;
--foreground: oklch(0.985 0 0);
--primary: #C8102E;
--accent: #FFD700;
--card: #13131A;
--border: oklch(1 0 0 / 10%);
```

### Breakpoint Variables

```css
--breakpoint-xs: 320px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Testing the Configuration

A test component is available at `app/tailwind-test.tsx` to verify:
- Custom color applications
- Responsive breakpoints
- Overflow prevention
- Dark mode theming

To view the test page during development:
1. Import the component in a page
2. Run `npm run dev`
3. Navigate to the test page

## Migration Notes from Tailwind v3

This project uses **Tailwind CSS v4**, which has breaking changes:

### Key Differences

1. **No `tailwind.config.ts` file** - Configuration is in CSS via `@theme inline`
2. **PostCSS plugin** - Uses `@tailwindcss/postcss` instead of `tailwindcss`
3. **CSS-based configuration** - Colors and breakpoints defined in `@theme` block
4. **Import syntax** - Uses `@import "tailwindcss"` in CSS

### For Developers

If you're familiar with Tailwind v3, note that:
- Custom colors are defined in the `@theme inline` block in `globals.css`
- The `darkMode` config is replaced by `@custom-variant dark`
- Breakpoints remain the same but are defined in CSS variables
- All utility classes work identically to v3

## Related Requirements

- **Requirement 14**: Dark Mode UI Theme
- **Requirement 22**: Responsive Layout for Mobile Devices

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
