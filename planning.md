# Navbar Refactor Plan

## 1. Current Issues
- The navbar line overlaps or visually clashes with the main content.
- Padding, alignment, or separation is insufficient.
- The navbar looks generic and lacks visual polish.

## 2. Goals
- Visually separate the navbar from the rest of the app.
- Improve spacing, alignment, and overall aesthetics.
- Make the navbar sticky (remains at the top on scroll) for better UX.
- Ensure accessibility and responsiveness.

## 3. Proposed Improvements
- Add a subtle box-shadow or bottom border to the navbar.
- Increase vertical and horizontal padding.
- Use flexbox for layout: app name left, nav links right.
- Ensure the navbar has a consistent background color.
- Make the navbar sticky on scroll (`sticky top-0 z-50` in Tailwind).
- Add hover/focus styles to nav links.
- Ensure mobile responsiveness (collapse or stack links if needed).

## 4. Implementation Steps
1. Identify the navbar component/file.
2. Refactor the navbar structure with semantic HTML.
3. Apply Tailwind classes for spacing, background, shadow, and sticky positioning.
4. Adjust nav link styles for hover/focus.
5. Test on desktop and mobile.
6. Check for accessibility (aria-labels, contrast).

---

## Dedicated Reading Page

### 1. Goal
- Create a focused, immersive reading experience for generated stories.
- Allow users to easily share stories via unique URLs.

### 2. Proposed Features
- **Route:** `/story/[storyId]` (or `/stories/[storyId]`)
- **Layout:**
    - Clean, minimal UI, optimized for readability.
    - Prominent display of the story title (if applicable, or first line as title).
    - Clear presentation of the generated image.
    - Well-formatted story text (good font, line height, paragraph spacing).
    - No form elements from the dashboard.
- **Data Fetching:**
    - The page will fetch story details (content, image URL, hero name, etc.) based on `storyId` from the URL.
    - This will likely involve a new API endpoint (e.g., `GET /api/stories/[storyId]`) or reusing an existing one if suitable.
- **Navigation:**
    - After a story is successfully generated on the dashboard, the user will be programmatically navigated (e.g., using Next.js `useRouter`) to `/story/[newStoryId]`.
    - A "Back to Dashboard" or "Create New Story" link on the reading page.

### 3. Implementation Steps
1.  **Create New Route/Page Component:**
    *   Set up `src/app/(app)/story/[storyId]/page.tsx` (or similar).
2.  **Design Reading Page UI:**
    *   Implement the layout with Tailwind CSS.
    *   Focus on typography and clean presentation of image and text.
3.  **API Endpoint for Story Data:**
    *   If needed, create or adapt an API route to fetch a single story by its ID.
    *   Ensure it returns all necessary data: content, image URL, title elements (hero name, etc.).
4.  **Data Fetching Logic:**
    *   In the new page component, use `useEffect` and `fetch` (or a data fetching library) to get story data based on `storyId` from `useParams()`.
5.  **Client-Side Redirection:**
    *   In `PresetGenerator.tsx`, after a story is successfully generated and saved (and `currentStoryId` is set), use `router.push(`/story/${currentStoryId}`)`.
6.  **Loading/Error States:**
    *   Implement loading skeletons/spinners while data is fetched on the story page.
    *   Handle cases where a story isn't found or an error occurs.
7.  **"Back" Navigation:**
    *   Add a link/button on the story page to navigate back to the dashboard.

### 4. Potential Enhancements (Future)
-   "Save to Favorites" button.
-   Social sharing buttons.
-   Print-friendly styles.
-   User ratings/feedback for stories.
