# Team Logo Badge Implementation Guide

## Overview
Modern asymmetrical rounded badge design for team logos across the entire application.

**Design Features:**
- Top-left corner: Rounded (curved)
- Top-right corner: Sharp (90°)
- Bottom-left corner: Sharp (90°)
- Bottom-right corner: Rounded (curved)
- Clean white outline border
- Hover effects with gold accent
- Dark background for contrast

## Implementation

### **Option 1: Use the Component** (Recommended)
```tsx
import { TeamLogoBadge } from '@/components/team-logo-badge'

<TeamLogoBadge
  src={match.home_team_logo}
  alt={match.home_team}
  teamName={match.home_team}
  size="md" // sm, md, lg, or xl
/>
```

### **Option 2: Use CSS Classes Directly**
```tsx
<div className="team-logo-badge team-logo-badge-md">
  {logo ? (
    <Image src={logo} alt={team} width={44} height={44} />
  ) : (
    <span className="team-logo-badge-fallback">{team[0]}</span>
  )}
</div>
```

## Size Guide

| Size | Dimensions | Use Case |
|------|-----------|----------|
| `sm` | 32x32px | Small cards, predictions list |
| `md` | 44x44px | Standard match cards, user predictions |
| `lg` | 56x56px | Featured matches, detail pages |
| `xl` | 72x72px | Hero sections, match headers |

## Files to Update

### ✅ **Priority 1: Main Match Pages**

1. **`app/matches/page.tsx`** - Authenticated matches list
   - Location: Inside `<MatchFixtureCard />` component
   - Recommended size: `md` (44px)

2. **`app/public-matches/page.tsx`** - Public matches page
   - Location: Team display sections in match cards
   - Current: Standard rounded divs
   - Replace with: `<TeamLogoBadge size="md" />`

3. **`components/match-fixture-card.tsx`** - Match card component
   - Location: Home/away team logo display
   - Recommended size: `md` (44px)

### ✅ **Priority 2: Prediction Pages**

4. **`app/my-predictions/page.tsx`** - User's own predictions
   - Location: Match team logos in prediction list
   - Recommended size: `sm` (32px)

5. **`app/admin/users/[id]/page.tsx`** - Admin player detail page
   - Location: Prediction history match cards
   - Recommended size: `sm` (32px)

6. **`components/prediction-form.tsx`** - Prediction submission form
   - Location: Match team display
   - Recommended size: `md` (44px)

### ✅ **Priority 3: Admin Pages**

7. **`app/admin/matches/page.tsx`** - Admin match management
   - Location: Match list items
   - Recommended size: `sm` (32px)

8. **`components/score-match-form.tsx`** - Admin scoring form
   - Location: Match team display
   - Recommended size: `md` (44px)

### ✅ **Priority 4: Match Detail Pages**

9. **`app/matches/[id]/page.tsx`** - Individual match detail
   - Location: Main match header, prediction lists
   - Recommended sizes: `xl` (header), `sm` (predictions)

## Example: Before & After

### **Before (Standard Rounded)**
```tsx
<div className="w-11 h-11 relative flex-shrink-0 bg-black/40 rounded border border-white/10">
  <Image src={logo} alt={team} fill className="object-contain p-1" />
</div>
```

### **After (Asymmetrical Badge)**
```tsx
<TeamLogoBadge
  src={logo}
  alt={team}
  teamName={team}
  size="md"
/>
```

## CSS Classes Available

- `.team-logo-badge` - Base badge style
- `.team-logo-badge-sm` - Small (32px)
- `.team-logo-badge-md` - Medium (44px)
- `.team-logo-badge-lg` - Large (56px)
- `.team-logo-badge-xl` - Extra large (72px)
- `.team-logo-badge-fallback` - Fallback text styling
- `.match-team-logo` - Special variant for match cards

## Hover Effects

All badges have built-in hover effects:
- Border color changes to gold (#F3A81D)
- Slight scale transform (1.05x)
- Background darkens
- Smooth transitions

## Browser Support

Works in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Notes

- The CSS is already added to `app/globals.css`
- The component is ready at `components/team-logo-badge.tsx`
- No additional dependencies required
- Fully responsive and accessible
- Optimized for dark themes

## Quick Implementation Checklist

For each page:
1. [ ] Import `TeamLogoBadge` component
2. [ ] Find all team logo displays (usually `<Image>` with team logos)
3. [ ] Replace with `<TeamLogoBadge />` component
4. [ ] Choose appropriate size based on context
5. [ ] Test hover effects
6. [ ] Verify fallback initials work (when no logo)

## Color Scheme

- Background: `rgba(0, 0, 0, 0.3)` (dark translucent)
- Border: `rgba(255, 255, 255, 0.1)` (subtle white)
- Hover Border: `rgba(243, 168, 29, 0.3)` (gold accent)
- Fallback Text: `#F3A81D` (gold)

---

**Status:** CSS and component ready. Apply to pages as needed.
**Priority:** Start with main match pages for maximum visual impact.
