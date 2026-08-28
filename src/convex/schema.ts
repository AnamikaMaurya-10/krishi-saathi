import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Farmer profiles
    farmerProfiles: defineTable({
      userId: v.optional(v.string()),
      name: v.string(),
      village: v.string(),
      district: v.string(),
      state: v.string(),
      crop: v.string(),
      farmSize: v.number(),
      sowingDate: v.string(),
      soilType: v.string(),
      irrigationAvailable: v.boolean(),
      language: v.string(),
      loanAmount: v.number(),
      loanDueDate: v.string(),
      loanLender: v.string(),
      phoneNumber: v.string(),
      riskScore: v.optional(v.number()),
      riskCategory: v.optional(v.string()),
    }).index("by_user", ["userId"]).index("by_district", ["district"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
