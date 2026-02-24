"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  RecommendationCard,
  RecommendationCardSkeleton,
} from "@/components/recommendation-card";
import { AddRecommendationForm } from "@/components/add-recommendation-form";
import { GenreFilter } from "@/components/genre-filter";
import { isValidGenre } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

function DashboardContent() {
  const { isAuthenticated } = useConvexAuth();
  const [genre, setGenre] = useState("all");
  const [deletingId, setDeletingId] = useState<Id<"recommendations"> | null>(
    null
  );

  const storeUser = useMutation(api.users.storeUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const allRecs = useQuery(
    api.recommendations.getAllRecommendations,
    isAuthenticated && genre === "all" ? {} : "skip"
  );
  const filteredRecs = useQuery(
    api.recommendations.getByGenre,
    isAuthenticated && genre !== "all" && isValidGenre(genre)
      ? { genre }
      : "skip"
  );
  const deleteRecommendation = useMutation(
    api.recommendations.deleteRecommendation
  );
  const markAsStaffPick = useMutation(api.recommendations.markAsStaffPick);

  // Sync user on mount
  useEffect(() => {
    if (isAuthenticated) {
      storeUser().catch(() => {
        // Silently fail — user may already exist
      });
    }
  }, [isAuthenticated, storeUser]);

  const recommendations = genre === "all" ? allRecs : filteredRecs;
  const isAdmin = currentUser?.role === "admin";

  const handleDelete = useCallback(
    async (id: Id<"recommendations">) => {
      setDeletingId(id);
      try {
        await deleteRecommendation({ id });
        toast.success("Recommendation deleted");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete recommendation";
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteRecommendation]
  );

  const handleToggleStaffPick = useCallback(
    async (id: Id<"recommendations">) => {
      try {
        await markAsStaffPick({ id });
        toast.success("Staff Pick updated");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update Staff Pick";
        toast.error(message);
      }
    },
    [markAsStaffPick]
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">
          Sign in to access the dashboard.
        </p>
        <SignInButton mode="modal">
          <Button>Sign in</Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GenreFilter value={genre} onChange={setGenre} />
          {isAdmin && (
            <span className="text-xs font-medium uppercase tracking-wider text-accent-foreground bg-accent px-2 py-1 rounded">
              Admin
            </span>
          )}
        </div>
        <AddRecommendationForm />
      </div>

      {/* Recommendations list */}
      <div className="mt-6">
        {recommendations === undefined ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RecommendationCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {genre === "all"
                ? "No recommendations yet. Add the first one!"
                : `No recommendations in this genre yet.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec._id}
                recommendation={rec}
                isOwner={rec.userId === currentUser?.clerkId}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onToggleStaffPick={handleToggleStaffPick}
                isDeleting={deletingId === rec._id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-8">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="font-semibold text-lg tracking-tight"
            >
              HypeShelf
            </Link>
          </div>
          <UserButton />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage and browse all recommendations.
        </p>
        <DashboardContent />
      </section>
    </main>
  );
}
