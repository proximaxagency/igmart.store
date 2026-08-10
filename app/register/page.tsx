"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center py-12 bg-background">
      <SignUp routing="hash" />
    </div>
  );
}
