import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Shared helper: get the authenticated user document from the `users` table.
 * Throws if the user is not signed in or not yet synced.
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found. Please sign in again.");
  }

  return user;
}

/**
 * Upsert the current Clerk user into the Convex `users` table.
 * Called from the client after sign-in to ensure we have a local user record.
 * New users get the "user" role; existing users get their display name updated.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const displayName =
      identity.name ?? identity.email ?? "Anonymous";

    if (existing) {
      // Update name if changed
      if (existing.name !== displayName) {
        await ctx.db.patch(existing._id, { name: displayName });
      }
      return existing._id;
    }

    // Create new user with default "user" role
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: displayName,
      role: "user",
    });
  },
});

/**
 * Get the current user's document (for client-side role checks in UI only).
 * Actual authorization is always enforced in mutations.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
