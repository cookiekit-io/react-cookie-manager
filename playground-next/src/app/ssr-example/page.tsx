// This file is an SSR page by default in Next.js App Router
// No "use client" directive needed

import { cookies } from "next/headers";

// Server component - this code runs on the server
export default async function SSRPage() {
  // This is server-side code. In Next.js 15 `cookies()` is async.
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "system";

  // Example of server-side data fetching
  const data = await fetchServerData();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Server-Side Rendered Page</h1>
      <div className="mb-4">
        <strong>Current theme from cookie:</strong> {theme}
      </div>
      <div className="mb-4">
        <strong>Server timestamp:</strong> {data.timestamp}
      </div>
      <div>
        <strong>Random number generated on server:</strong> {data.randomNumber}
      </div>
    </div>
  );
}

// Server-side only function
async function fetchServerData() {
  // This function only runs on the server
  return {
    timestamp: new Date().toISOString(),
    randomNumber: Math.floor(Math.random() * 100),
  };
}
