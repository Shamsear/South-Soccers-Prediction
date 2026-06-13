# Admin Leaderboard Poster Studio: UI & Preview System Guide

This guide explains the visual layout, controls, and rendering strategy for the Admin Leaderboard Poster Studio. It ensures the exported graphic looks premium while the admin controls remain intuitive.

## Overview: What the Admin Sees

```text
┌──────────────────────────────────────────────────────────┐
│  🏆 [Generate Poster]  ← Toggle button on Leaderboard    │
├──────────────────────────────────────────────────────────┤
│  STUDIO HEADER                                           │
│  ┌──────────────────────────────────┐                    │
│  │ 🎨 Leaderboard Poster Studio    │                    │
│  └──────────────────────────────────┘                    │
│  Include: [ Top 5 ] [ Top 10 ]                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LIVE PREVIEW (Scaled to fit)                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Logo] CURRENT STANDINGS             [Date]       │  │
│  │                                                    │  │
│  │  1. Username1 ........................ 120 pts     │  │
│  │  2. Username2 ........................ 105 pts     │  │
│  │  3. Username3 ........................  98 pts     │  │
│  │  4. Username4 ........................  95 pts     │  │
│  │  5. Username5 ........................  80 pts     │  │
│  │                                                    │  │
│  │            play.southsoccers.com                   │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [⬇️ Download PNG]          [📋 Copy to Clipboard]       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 1. The Design System

Since this graphic will be shared on social media, the design must strictly follow the application's branding (Dark/Cyberpunk theme).

*   **Background**: Deep dark background (`bg-[#030306]`) with a subtle grid overlay or noise texture to give it a premium feel.
*   **Typography**: Use the heavy, uppercase font (`font-heading`) for titles and names, and a monospaced or highly readable sans-serif for points.
*   **Colors**: 
    *   Primary text: White
    *   Accents: Gold/Yellow (`text-[#F3A81D]`) for the ranks and total points.
    *   Subtitles/Metadata: Muted gray (`text-[#8A92A6]`).

## 2. The CSS Scale Trick

To show the admin exactly what will be exported without overflowing their screen, we use the CSS scale trick. The actual poster component might be `1080px` wide, but the container displaying it on the admin page is scaled down to `40%` or `50%`.

```css
/* Container holding the preview */
.preview-container {
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

/* The actual poster component inside */
.poster-preview {
  width: 1080px;
  height: 1080px; /* or 1350px for portrait */
  transform: scale(0.45);
  transform-origin: top center;
}
```

## 3. Action Buttons & States

*   **Download PNG Button**: Triggers `htmlToImage.toPng()`. Should show a loading spinner while generating (can take 1-2 seconds) and briefly flash a green "Success" checkmark before reverting to idle.
*   **Copy to Clipboard Button**: Triggers `htmlToImage.toBlob()` and uses the `navigator.clipboard.write()` API to copy the image directly for pasting into WhatsApp/Discord.

## 4. Responsive Considerations

Because the poster itself is a fixed size (`1080px`), it is inherently non-responsive. **This is intentional.** The graphic must look exactly the same regardless of whether the admin generates it from their phone or a 4K desktop monitor. Only the *scale* of the preview window changes based on the admin's device screen width.
