"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center py-12 bg-background">
      <SignIn routing="hash" />
    </div>
  );
}
