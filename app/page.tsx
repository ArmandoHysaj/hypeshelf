"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  RecommendationCard,
  RecommendationCardSkeleton,
} from "@/components/recommendation-card";
import { ArrowRight } from "lucide-react";

function LatestRecommendations() {
  const recommendations = useQuery(api.recommendations.getLatestPublic);

  if (recommendations === undefined) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <RecommendationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground text-sm">
          No recommendations yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec._id} recommendation={rec} readOnly />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            HypeShelf
          </Link>
          <Authenticated>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5">
                Dashboard
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-12">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          HypeShelf
        </h1>
        <p className="mt-3 text-lg text-muted-foreground text-pretty max-w-xl leading-relaxed">
          Collect and share the stuff you are hyped about.
        </p>
        <Unauthenticated>
          <SignInButton mode="modal">
            <Button className="mt-6 gap-2">
              Sign in to add yours
              <ArrowRight className="size-4" />
            </Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Link href="/dashboard">
            <Button className="mt-6 gap-2">
              Go to Dashboard
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Authenticated>
      </section>

      {/* Latest Recommendations */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          Latest Picks
        </h2>
        <LatestRecommendations />
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <p className="text-xs text-muted-foreground">
            {"Built with Next.js, Convex, and Clerk."}
          </p>
        </div>
      </footer>
    </main>
  );
}
