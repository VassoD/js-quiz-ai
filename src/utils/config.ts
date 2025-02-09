export const config = {
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
    apiUrl: process.env.MISTRAL_API_URL,
  },
} as const;

// Type checking for required environment variables
const requiredEnvs = ["MISTRAL_API_KEY", "MISTRAL_API_URL"] as const;

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
});
