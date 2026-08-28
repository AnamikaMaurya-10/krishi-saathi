import type { AuthConfig } from "convex/server";

// Standard Convex Auth configuration.
// The domain-based provider uses OIDC discovery at
// `${domain}/.well-known/openid-configuration` served by auth.addHttpRoutes()
// in convex/http.ts. This is the standard Convex Auth pattern for email OTP
// and anonymous sign-in.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
