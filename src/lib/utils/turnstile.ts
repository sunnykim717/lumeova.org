/**
 * Cloudflare Turnstile server-side verification
 */

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

/**
 * Verify Turnstile token on the server side
 * @param token - The token returned by the Turnstile widget
 * @returns Whether the token is valid
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development without a secret key, allow all requests
  // In production, fail closed if key is missing
  if (!secretKey) {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!isDevelopment) {
      console.error("TURNSTILE_SECRET_KEY is not configured");
      return false;
    }
    console.warn("Turnstile verification skipped: TURNSTILE_SECRET_KEY not set");
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error("Turnstile API error:", response.statusText);
      return false;
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn("Turnstile verification failed:", data.error_codes);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
