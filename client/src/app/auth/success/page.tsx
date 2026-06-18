// app/auth/success/page.tsx
import { Suspense } from "react";
import AuthSuccessContent from "./AuthSuccessContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}