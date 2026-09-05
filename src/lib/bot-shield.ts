"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client half of the bot protection.
 *
 * Fetches a proof-of-work challenge as soon as the form mounts, then solves it
 * when the form is submitted. Fetching early does double duty: the puzzle is
 * ready by the time it is needed, and the challenge's server-issued timestamp
 * becomes an honest measure of how long the visitor spent on the page.
 */

type Challenge = { challenge: string; difficulty: number };

function leadingZeroBits(bytes: Uint8Array): number {
  let bits = 0;
  for (const byte of bytes) {
    if (byte === 0) {
      bits += 8;
      continue;
    }
    bits += Math.clz32(byte) - 24;
    break;
  }
  return bits;
}

async function solve(
  challenge: string,
  difficulty: number,
): Promise<{ challenge: string; solution: string }> {
  const encoder = new TextEncoder();

  for (let n = 0; ; n++) {
    const solution = String(n);
    const digest = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${challenge}${solution}`),
    );

    if (leadingZeroBits(new Uint8Array(digest)) >= difficulty) {
      return { challenge, solution };
    }

    // Yield periodically so the tab stays responsive on slower devices.
    if (n % 2000 === 1999) await new Promise((r) => setTimeout(r, 0));
  }
}

async function fetchChallenge(purpose: string): Promise<Challenge> {
  const response = await fetch(`/api/challenge?purpose=${purpose}`);
  if (!response.ok) throw new Error("Could not start the bot check.");
  return response.json();
}

export function useBotShield(purpose: string) {
  const [issued, setIssued] = useState<Challenge | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchChallenge(purpose)
      .then((c) => {
        if (!cancelled) setIssued(c);
      })
      .catch(() => {
        // Leave it null — solveNow() falls back to fetching on demand.
      });
    return () => {
      cancelled = true;
    };
  }, [purpose]);

  /** Solves the challenge fetched at mount, or fetches a fresh one if that
   *  request failed. Call this as the form is submitted. */
  const solveNow = useCallback(async () => {
    const current = issued ?? (await fetchChallenge(purpose));
    return solve(current.challenge, current.difficulty);
  }, [issued, purpose]);

  return { solveNow };
}
