import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

const VALID_GENRES = ["horror", "action", "comedy", "drama", "sci-fi", "other"];

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Public query: latest 5 recommendations, no auth required.
 */
export const getLatestPublic = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("recommendations")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);
    return all;
  },
});

/**
 * All recommendations (requires auth). Ordered newest-first.
 */
export const getAllRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("recommendations")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

/**
 * Filter recommendations by genre (requires auth).
 */
export const getByGenre = query({
  args: { genre: v.string() },
  handler: async (ctx, { genre }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    if (!VALID_GENRES.includes(genre)) {
      throw new Error(`Invalid genre: ${genre}`);
    }
    return await ctx.db
      .query("recommendations")
      .withIndex("by_genre", (q) => q.eq("genre", genre))
      .order("desc")
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a recommendation. Auth required. RBAC: any authenticated user.
 */
export const createRecommendation = mutation({
  args: {
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, { title, genre, link, blurb }) => {
    const user = await getAuthenticatedUser(ctx);

    // --- Validation ---
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length > 120) {
      throw new Error("Title is required and must be 120 characters or fewer.");
    }

    if (!VALID_GENRES.includes(genre)) {
      throw new Error(`Invalid genre. Must be one of: ${VALID_GENRES.join(", ")}`);
    }

    try {
      new URL(link);
    } catch {
      throw new Error("Link must be a valid URL (e.g. https://example.com).");
    }

    const trimmedBlurb = blurb.trim();
    if (trimmedBlurb.length > 300) {
      throw new Error("Blurb must be 300 characters or fewer.");
    }

    return await ctx.db.insert("recommendations", {
      title: trimmedTitle,
      genre,
      link,
      blurb: trimmedBlurb,
      userId: user.clerkId,
      userName: user.name,
      isStaffPick: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Delete a recommendation.
 * - "user" role: can only delete own recommendations.
 * - "admin" role: can delete any recommendation.
 */
export const deleteRecommendation = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const user = await getAuthenticatedUser(ctx);
    const rec = await ctx.db.get(id);

    if (!rec) {
      throw new Error("Recommendation not found.");
    }

    if (user.role !== "admin" && rec.userId !== user.clerkId) {
      throw new Error("You can only delete your own recommendations.");
    }

    if (user.role === "admin" && rec.userId !== user.clerkId) {
      console.log(
        `[ADMIN ACTION] User ${user.clerkId} (${user.name}) deleted recommendation "${rec.title}" (owner: ${rec.userId})`
      );
    }

    await ctx.db.delete(id);
  },
});

/**
 * Mark a recommendation as Staff Pick. Admin only.
 * Ensures only one Staff Pick exists at a time.
 */
export const markAsStaffPick = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const user = await getAuthenticatedUser(ctx);

    if (user.role !== "admin") {
      throw new Error("Only admins can mark Staff Picks.");
    }

    const rec = await ctx.db.get(id);
    if (!rec) {
      throw new Error("Recommendation not found.");
    }

    // If already a staff pick, toggle it off
    if (rec.isStaffPick) {
      await ctx.db.patch(id, { isStaffPick: false });
      console.log(
        `[ADMIN ACTION] User ${user.clerkId} (${user.name}) removed Staff Pick from "${rec.title}"`
      );
      return;
    }

    // Remove existing staff pick (only one allowed)
    const existing = await ctx.db
      .query("recommendations")
      .filter((q) => q.eq(q.field("isStaffPick"), true))
      .collect();

    for (const item of existing) {
      await ctx.db.patch(item._id, { isStaffPick: false });
    }

    // Set new staff pick
    await ctx.db.patch(id, { isStaffPick: true });
    console.log(
      `[ADMIN ACTION] User ${user.clerkId} (${user.name}) marked "${rec.title}" as Staff Pick`
    );
  },
});
