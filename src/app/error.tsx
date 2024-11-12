'use client';

import { CustomErrorPage } from "@/components/ErrorBoundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <CustomErrorPage
      statusCode={500}
      title="Something went wrong"
      message="An unexpected error occurred. Please try again later."
    />
  );
} 