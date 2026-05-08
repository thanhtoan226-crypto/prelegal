"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NDARedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/create/mutual-nda");
  }, [router]);
  return null;
}
