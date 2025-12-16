/**
 * CrochetAI Constants
 * Credit costs and configuration
 */

// Credit costs per pattern type
export const PATTERN_CREDITS = {
  simple: 2,      // ball, coaster
  basic: 4,       // whale, basic shapes
  standard: 5,    // manatee, octopus
  complex: 7,     // teddy bear, cat, dog
  custom: 10,     // custom requests
} as const;

export type PatternComplexity = keyof typeof PATTERN_CREDITS;

