"use client";

import { ErrorPage } from "@/components/error-pages/error-page";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage error={error} isDev={process.env.NODE_ENV === "development"} onReset={reset} />
  );
}
