"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface Recommendation {
  _id: Id<"recommendations">;
  title: string;
  genre: string;
  link: string;
  blurb: string;
  userId: string;
  userName: string;
  isStaffPick: boolean;
  createdAt: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isOwner?: boolean;
  isAdmin?: boolean;
  onDelete?: (id: Id<"recommendations">) => void;
  onToggleStaffPick?: (id: Id<"recommendations">) => void;
  isDeleting?: boolean;
  readOnly?: boolean;
}

export function RecommendationCard({
  recommendation,
  isOwner = false,
  isAdmin = false,
  onDelete,
  onToggleStaffPick,
  isDeleting = false,
  readOnly = false,
}: RecommendationCardProps) {
  const canDelete = !readOnly && (isOwner || isAdmin);
  const canToggleStaffPick = !readOnly && isAdmin;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        recommendation.isStaffPick &&
          "border-staff-pick-border bg-staff-pick/10 ring-1 ring-staff-pick-border/50"
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base leading-snug">
                {recommendation.title}
              </CardTitle>
              {recommendation.isStaffPick && (
                <Badge className="bg-staff-pick text-staff-pick-foreground border-staff-pick-border gap-1 shrink-0">
                  <Star className="size-3 fill-current" />
                  Staff Pick
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize text-xs">
                {recommendation.genre}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {"by "}
                {recommendation.userName}
              </span>
            </div>
          </div>
          {(canDelete || canToggleStaffPick) && (
            <div className="flex items-center gap-1 shrink-0">
              {canToggleStaffPick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8",
                    recommendation.isStaffPick &&
                      "text-staff-pick-foreground hover:text-staff-pick-foreground"
                  )}
                  onClick={() => onToggleStaffPick?.(recommendation._id)}
                  title={
                    recommendation.isStaffPick
                      ? "Remove Staff Pick"
                      : "Mark as Staff Pick"
                  }
                >
                  <Star
                    className={cn(
                      "size-4",
                      recommendation.isStaffPick && "fill-current"
                    )}
                  />
                  <span className="sr-only">
                    {recommendation.isStaffPick
                      ? "Remove Staff Pick"
                      : "Mark as Staff Pick"}
                  </span>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete?.(recommendation._id)}
                  disabled={isDeleting}
                  title="Delete recommendation"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recommendation.blurb && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {recommendation.blurb}
          </p>
        )}
        <a
          href={recommendation.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
        >
          <ExternalLink className="size-3.5" />
          View recommendation
        </a>
      </CardContent>
    </Card>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-4 w-full rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse mb-3" />
        <div className="h-4 w-36 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}
