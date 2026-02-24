import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recommendations: defineTable({
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
    userId: v.string(),
    userName: v.string(),
    isStaffPick: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_genre", ["genre"]),

  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    role: v.string(),
  }).index("by_clerkId", ["clerkId"]),
});
