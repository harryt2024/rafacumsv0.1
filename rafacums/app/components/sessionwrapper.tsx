// app/components/SessionWrapper.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function SessionWrapper({ children }: Props): React.ReactNode {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}