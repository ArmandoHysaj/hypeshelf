"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import { toast } from "sonner";
import { GENRES, type Genre } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const recommendationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  genre: z.enum(GENRES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a genre" }),
  }),
  link: z.string().url("Must be a valid URL (e.g. https://example.com)"),
  blurb: z
    .string()
    .trim()
    .max(300, "Blurb must be 300 characters or fewer"),
});

export function AddRecommendationForm() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre | "">("");
  const [link, setLink] = useState("");
  const [blurb, setBlurb] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createRecommendation = useMutation(
    api.recommendations.createRecommendation
  );

  function resetForm() {
    setTitle("");
    setGenre("");
    setLink("");
    setBlurb("");
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = recommendationSchema.safeParse({ title, genre, link, blurb });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field && !fieldErrors[String(field)]) {
          fieldErrors[String(field)] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecommendation(result.data);
      toast.success("Recommendation added!");
      resetForm();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add recommendation";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Recommendation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Recommendation</DialogTitle>
          <DialogDescription>
            Share something you are hyped about with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Shawshank Redemption"
              maxLength={120}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="genre">
              Genre <span className="text-destructive">*</span>
            </Label>
            <Select
              value={genre}
              onValueChange={(v) => setGenre(v as Genre)}
            >
              <SelectTrigger id="genre" className="w-full" aria-invalid={!!errors.genre}>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g} className="capitalize">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.genre && (
              <p className="text-xs text-destructive">{errors.genre}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link">
              Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              aria-invalid={!!errors.link}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="blurb">Blurb</Label>
            <Textarea
              id="blurb"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="What makes this worth watching?"
              maxLength={300}
              rows={3}
              aria-invalid={!!errors.blurb}
            />
            <div className="flex items-center justify-between">
              {errors.blurb ? (
                <p className="text-xs text-destructive">{errors.blurb}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">
                {blurb.length}/300
              </span>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Recommendation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
