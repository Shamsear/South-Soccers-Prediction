# Admin Leaderboard Poster Studio: Architecture & Concept

The **Admin Leaderboard Poster Studio** is a powerful, client-side system designed to dynamically generate premium, shareable images (posters) of the current leaderboard standings directly within the browser. 

This document outlines the architecture required to build this feature exclusively for the Admin Leaderboard in our Next.js application.

## 1. The Core Concept: DOM-to-Image

Instead of relying on a complex backend server running headless browsers or Python image manipulation libraries, the Poster Studio leverages the admin's own browser to do the heavy lifting.

We build the poster exactly like a regular React component using HTML, CSS (Tailwind), and dynamic data props. Then, we use a library to take a "snapshot" of that DOM node, draw it onto an invisible HTML5 `<canvas>`, and export it as a `.png` data URL.

### Recommended Dependency
**`html-to-image`**: The most modern and reliable library for this task. It handles SVGs, CSS filters, and modern flexbox layouts better than older alternatives like `html2canvas`.
```bash
npm install html-to-image
```

## 2. The Two-Tier Architecture

To ensure the exported graphic is always pristine and perfectly proportioned, we use a **Two-Tier Architecture**. We do not capture the responsive UI directly; instead, we capture a fixed-size, hidden element.

1. **The Preview UI**: A responsive, scaled-down, interactive component the admin sees on their screen inside the Studio modal.
2. **The Snapshot Component**: A hidden, fixed-dimension component (e.g., `1080x1350` for Instagram portrait) designed exclusively for the camera.

```jsx
export default function AdminLeaderboardStudio({ leaderboardData }) {
  const exportRef = useRef<HTMLDivElement>(null);
  
  const downloadPoster = async () => {
    if (!exportRef.current) return;
    
    // The library targets the hidden, fixed-size container
    const dataUrl = await htmlToImage.toPng(exportRef.current, {
      quality: 1.0,
      pixelRatio: 2 // For retina/high-res export
    });
    
    // Trigger download...
  };
  
  return (
    <div>
      {/* 1. Scaled down preview for the user */}
      <div className="preview-container scale-75">
         <PosterTemplate data={leaderboardData} />
      </div>
      
      {/* 2. Hidden fixed-size element for the camera */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={exportRef} style={{ width: 1080, height: 1350 }}>
          <PosterTemplate data={leaderboardData} />
        </div>
      </div>
    </div>
  );
}
```

## 3. Dynamic Data Injection

The Poster Studio will exclusively pull data from the Admin Leaderboard state. 
It requires:
- The top predictors (Rank, Username, Points, Accuracy).
- The current date/time to stamp the graphic.
- Custom options selected by the admin (e.g., showing Top 5 vs Top 10).

Because it's a standard React component, updating the "Top N" filter will instantly update both the Preview UI and the hidden Snapshot Component.

## 4. Why Client-Side?
* **Zero Server Cost**: No need for expensive serverless functions or headless Chrome instances.
* **Instantaneous**: The preview updates in real-time as the admin changes settings.
* **Security**: Leaderboard data is already fetched securely for the admin page; the image generation inherits this without needing new API endpoints.