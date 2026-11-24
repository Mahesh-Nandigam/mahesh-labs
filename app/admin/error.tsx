"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="studio-empty">
      <h1>Studio couldn’t load.</h1>
      <p>Please check the database connection and try again.</p>
      <button className="studio-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
