export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://full-wombat-47.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
