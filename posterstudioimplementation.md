# Admin Leaderboard Poster Studio: Implementation Plan

This document details the step-by-step implementation plan for integrating the Poster Studio generator exclusively into the **Admin Leaderboard** page (`app/leaderboard/page.tsx`).

## 1. Prerequisites
Ensure the `html-to-image` package is installed in the project.
```bash
npm install html-to-image
```

## 2. Component Structure

We will create a new client component specifically for this feature.
**Path**: `components/admin-leaderboard-poster.tsx`

### Props Required
The component needs to accept the current leaderboard data from the page.
```typescript
interface AdminLeaderboardPosterProps {
  leaderboard: {
    rank: number;
    username: string;
    total_points: number;
    correct_predictions: number;
  }[];
}
```

## 3. The Implementation Steps

### Step 1: Create the Poster Template
Design a pure React component (`<PosterTemplate />`) that represents the final image. 
*   **Dimensions**: Hardcoded to `1080px` by `1350px` (Instagram Portrait) or `1080px` by `1080px` (Square).
*   **Styling**: Use inline styles or strict Tailwind utility classes. Avoid relying on global CSS that `html-to-image` might fail to parse.
*   **Content**: 
    *   Header: "Official Leaderboard Standings" + Logo.
    *   List: Map over the `leaderboard` prop (sliced by the selected Top N).
    *   Footer: Current Date + Platform URL.

### Step 2: Build the Modal Wrapper
Wrap the feature in a collapsible panel or modal inside `components/admin-leaderboard-poster.tsx`.
*   Include a "Top 5" vs "Top 10" toggle that modifies the sliced data passed to `<PosterTemplate />`.
*   Include the CSS `scale` trick to show the preview without breaking the admin's layout:
    ```jsx
    <div className="preview-window overflow-hidden flex justify-center items-center h-[500px]">
       <div className="transform scale-[0.4] origin-top">
          <PosterTemplate data={slicedData} />
       </div>
    </div>
    ```

### Step 3: Integrate the Export Logic
Add the `html-to-image` export function.
```typescript
import { toPng } from 'html-to-image';

const handleDownload = async () => {
  setIsGenerating(true);
  try {
    const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `leaderboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to generate poster', err);
  } finally {
    setIsGenerating(false);
  }
};
```

### Step 4: Inject into the Admin Page
Modify `app/leaderboard/page.tsx` to include the toggle button and the component.
*   Pass the fetched `leaderboardData` directly into `<AdminLeaderboardPoster leaderboard={leaderboardData} />`.
*   Place the button near the top of the leaderboard table (e.g., next to the Search bar).

## 4. Potential Pitfalls & Fixes
*   **External Images (CORS)**: If avatars are hosted on Supabase Storage or external URLs, `html-to-image` may fail. Fix: Omit avatars from the poster, or proxy them to base64 before rendering.
*   **Font Loading**: Custom fonts might not render if the snapshot is taken before fonts are loaded. Fix: Pre-load fonts or wait a few milliseconds before capturing.