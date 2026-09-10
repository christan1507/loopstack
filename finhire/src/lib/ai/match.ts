export interface MatchResult {
  score: number;
  matched: string[];
  gaps: string[];
}

/**
 * Compute a match score between a candidate's skills and a job's required skills.
 *
 * Skill names are normalized to lowercase for case-insensitive comparison.
 *
 * @param candidateSkills - Array of skill names the candidate possesses
 * @param jobRequirements - Array of required skill names for the job
 * @returns Match result with score (0-100), matched skills, and gaps
 */
export function computeMatchScore(
  candidateSkills: string[],
  jobRequirements: string[]
): MatchResult {
  if (jobRequirements.length === 0) {
    return { score: 0, matched: [], gaps: [] };
  }

  const normalizedCandidate = candidateSkills
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const normalizedRequirements = jobRequirements
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedRequirements.length === 0) {
    return { score: 0, matched: [], gaps: [] };
  }

  const matched: string[] = [];
  const gaps: string[] = [];

  for (const req of normalizedRequirements) {
    if (normalizedCandidate.some((skill) => skill === req)) {
      matched.push(req);
    } else {
      gaps.push(req);
    }
  }

  const score = Math.round((matched.length / normalizedRequirements.length) * 100);

  return { score, matched, gaps };
}
