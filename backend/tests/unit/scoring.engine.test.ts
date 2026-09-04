/**
 * scoring.engine.test.ts
 * Role 5 — AI / Recommendation Engine
 *
 * Unit tests for the deterministic Compatibility Scoring Engine.
 * All tests are fully deterministic. No external API or database calls.
 *
 * Covers all 20 required test cases from the USER_REQUEST task specification.
 */

import {
  computeCompatibilityScore,
  parseEligibilityScore,
  computeInterestScore,
  PROFICIENCY_SCORES,
  DEFAULT_REQUIRED_PROFICIENCY_SCORE,
} from '../../src/modules/recommendation/scoring.engine';

import type {
  StudentSkillState,
  RoleSkill,
  OpportunityWithTags,
  StudentProfileContext,
} from '../../src/modules/recommendation/recommendation.types';

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const SKILL_PYTHON = 'skill-python';
const SKILL_SQL    = 'skill-sql';
const SKILL_DOCKER = 'skill-docker';
const DOMAIN_SWE   = 'domain-swe';
const DOMAIN_AI    = 'domain-ai';

const baseProfile: StudentProfileContext = {
  selectedDomainId: DOMAIN_SWE,
  yearOfStudy: 2,
  interests: ['Software Engineering'],
};

const baseRoleSkills: RoleSkill[] = [
  { id: SKILL_PYTHON, name: 'Python',   targetProficiency: 'PROFICIENT', weight: 1.0 },
  { id: SKILL_SQL,    name: 'SQL',      targetProficiency: 'PROFICIENT', weight: 1.0 },
  { id: SKILL_DOCKER, name: 'Docker',   targetProficiency: 'INTERMEDIATE', weight: 1.0 },
];

/**
 * Helper: build a minimal OpportunityWithTags for a simple single-skill scenario.
 */
function makeOpportunity(
  skillId: string,
  confidence: number,
  domainId: string | null = DOMAIN_SWE,
  eligibilityRaw: string | null = null,
  domainName: string | null = 'Software Engineering'
): OpportunityWithTags {
  return {
    domainId,
    domain: domainName ? { name: domainName } : null,
    eligibilityRaw,
    skillTags: [
      { skillId, skill: { name: skillId }, confidence },
    ],
  };
}

// ---------------------------------------------------------------------------
// 1. Perfect skill match
// ---------------------------------------------------------------------------

describe('Skill Match — perfect match', () => {
  it('(1) returns 1.0 skill match when student is exactly at required level (INTERMEDIATE)', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'INTERMEDIATE' },
    ];
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // INTERMEDIATE (3) vs required INTERMEDIATE (3): min(3,3)/3 = 1.0
    expect(scores.skillMatch).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// 2. Partial skill match
// ---------------------------------------------------------------------------

describe('Skill Match — partial match', () => {
  it('(2) returns 0.667 skill match when student is BEGINNER (2) and required is INTERMEDIATE (3)', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'BEGINNER' },
    ];
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // min(2,3)/3 = 2/3 ≈ 0.667
    expect(scores.skillMatch).toBeCloseTo(0.667, 3);
  });

  it('(2b) returns weighted average when two skills have different matches', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'INTERMEDIATE' }, // 3/3 = 1.0
      { skillId: SKILL_SQL,    assessedLevel: 'BEGINNER' },      // 2/3 ≈ 0.667
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
        { skillId: SKILL_SQL,    skill: { name: 'SQL' },    confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // (1.0*1.0 + 0.667*1.0) / (1.0+1.0) = 1.667/2 ≈ 0.833
    expect(scores.skillMatch).toBeCloseTo(0.833, 2);
  });
});

// ---------------------------------------------------------------------------
// 3. Missing student skills (UNASSESSED)
// ---------------------------------------------------------------------------

describe('Skill Match — missing student skills', () => {
  it('(3) uses UNASSESSED=0 for a skill not present in student states', () => {
    const skillStates: StudentSkillState[] = []; // No skills assessed
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // UNASSESSED (0) vs INTERMEDIATE (3): min(0,3)/3 = 0/3 = 0
    expect(scores.skillMatch).toBe(0.0);
  });

  it('(3b) assessedLevel null is treated as UNASSESSED', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: null },
    ];
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    expect(scores.skillMatch).toBe(0.0);
  });
});

// ---------------------------------------------------------------------------
// 4. Required proficiency defaults to INTERMEDIATE when not specified
// ---------------------------------------------------------------------------

describe('Skill Match — default required proficiency', () => {
  it('(4) when tag has no requiredLevel, defaults to INTERMEDIATE (score=3) for calculation', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'AWARENESS' }, // level 1
    ];
    // Tag has no requiredLevel — engine should use INTERMEDIATE=3
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
        // requiredLevel intentionally omitted
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // AWARENESS (1) vs INTERMEDIATE (3) = min(1,3)/3 = 1/3 ≈ 0.333
    expect(scores.skillMatch).toBeCloseTo(1 / 3, 3);
    expect(DEFAULT_REQUIRED_PROFICIENCY_SCORE).toBe(PROFICIENCY_SCORES['INTERMEDIATE']);
  });
});

// ---------------------------------------------------------------------------
// 5. Skill-tag confidence weighting
// ---------------------------------------------------------------------------

describe('Skill Match — confidence weighting', () => {
  it('(5) higher-confidence tags have more weight in the final score', () => {
    // High-confidence (0.9) tag: student UNASSESSED → contributes 0
    // Low-confidence  (0.1) tag: student INTERMEDIATE → contributes 1.0
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'UNASSESSED' },
      { skillId: SKILL_SQL,    assessedLevel: 'INTERMEDIATE' },
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 0.9 },
        { skillId: SKILL_SQL,    skill: { name: 'SQL' },    confidence: 0.1 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // weightedSum = 0 * 0.9 + 1.0 * 0.1 = 0.1
    // totalWeight = 0.9 + 0.1 = 1.0
    // skillMatch = 0.1 / 1.0 = 0.1
    expect(scores.skillMatch).toBeCloseTo(0.1, 3);
  });

  it('(5b) equal-confidence tags produce simple average', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'INTERMEDIATE' }, // 1.0
      { skillId: SKILL_SQL,    assessedLevel: 'UNASSESSED' },   // 0.0
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 0.5 },
        { skillId: SKILL_SQL,    skill: { name: 'SQL' },    confidence: 0.5 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // weightedSum = 1.0*0.5 + 0.0*0.5 = 0.5
    // totalWeight = 1.0
    // skillMatch = 0.5
    expect(scores.skillMatch).toBeCloseTo(0.5, 3);
  });
});

// ---------------------------------------------------------------------------
// 6. No skill tags → neutral 0.5
// ---------------------------------------------------------------------------

describe('Skill Match — no skill tags', () => {
  it('(6) returns skillMatch = 0.5 when opportunity has no skill tags', () => {
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [],
    };

    const scores = computeCompatibilityScore([], baseRoleSkills, opp, baseProfile);
    expect(scores.skillMatch).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// 7. Student proficiency higher than required proficiency (capped at 1.0)
// ---------------------------------------------------------------------------

describe('Skill Match — student above required level', () => {
  it('(7) EXPERT student only gets 1.0 contribution on an INTERMEDIATE requirement', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'EXPERT' }, // 5
    ];
    // Requirement defaults to INTERMEDIATE (3)
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // min(5,3)/3 = 3/3 = 1.0
    expect(scores.skillMatch).toBe(1.0);
  });

  it('(7b) PROFICIENT student (4) on INTERMEDIATE requirement (3) is capped at 1.0', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'PROFICIENT' },
    ];
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    // min(4,3)/3 = 1.0
    expect(scores.skillMatch).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// 8. Final skillMatch never exceeds 1.0
// ---------------------------------------------------------------------------

describe('Skill Match — never exceeds 1.0', () => {
  it('(8) skillMatch is always <= 1.0 regardless of inputs', () => {
    const scenarios: Array<{ level: StudentSkillState['assessedLevel']; confidence: number }> = [
      { level: 'EXPERT',       confidence: 1.0 },
      { level: 'PROFICIENT',   confidence: 2.0 }, // edge: high confidence
      { level: 'INTERMEDIATE', confidence: 1.0 },
    ];

    for (const { level, confidence } of scenarios) {
      const skillStates: StudentSkillState[] = [
        { skillId: SKILL_PYTHON, assessedLevel: level },
      ];
      const opp: OpportunityWithTags = {
        domainId: DOMAIN_SWE,
        domain: { name: 'Software Engineering' },
        eligibilityRaw: null,
        skillTags: [{ skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence }],
      };

      const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
      expect(scores.skillMatch).toBeLessThanOrEqual(1.0);
    }
  });
});

// ---------------------------------------------------------------------------
// 9. Exact career-domain match
// ---------------------------------------------------------------------------

describe('Career Alignment', () => {
  it('(9) exact domain match returns careerAlignment = 1.0', () => {
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,   // same as profile.selectedDomainId
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [],
    };

    const scores = computeCompatibilityScore([], baseRoleSkills, opp, baseProfile);
    expect(scores.careerAlignment).toBe(1.0);
  });

  // ---------------------------------------------------------------------------
  // 10. Career-domain mismatch
  // ---------------------------------------------------------------------------

  it('(10) domain mismatch returns careerAlignment = 0.2', () => {
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_AI,    // different from profile (DOMAIN_SWE)
      domain: { name: 'Artificial Intelligence' },
      eligibilityRaw: null,
      skillTags: [],
    };

    const scores = computeCompatibilityScore([], baseRoleSkills, opp, baseProfile);
    expect(scores.careerAlignment).toBe(0.2);
  });

  // ---------------------------------------------------------------------------
  // 11. Opportunity without a domain
  // ---------------------------------------------------------------------------

  it('(11) null domainId returns careerAlignment = 0.6 (benefit of doubt)', () => {
    const opp: OpportunityWithTags = {
      domainId: null,
      domain: null,
      eligibilityRaw: null,
      skillTags: [],
    };

    const scores = computeCompatibilityScore([], baseRoleSkills, opp, baseProfile);
    expect(scores.careerAlignment).toBe(0.6);
  });
});

// ---------------------------------------------------------------------------
// Eligibility tests (12-15)
// ---------------------------------------------------------------------------

describe('Eligibility — parseEligibilityScore', () => {
  it('(12) exact matching year returns 1.0', () => {
    // Student is in year 2; eligibility says "2nd year"
    expect(parseEligibilityScore('Open to 2nd year students', 2)).toBe(1.0);
    expect(parseEligibilityScore('second year only', 2)).toBe(1.0);
  });

  it('(12b) final year / 4th year matches year 4', () => {
    expect(parseEligibilityScore('final year students', 4)).toBe(1.0);
    expect(parseEligibilityScore('4th year students', 4)).toBe(1.0);
  });

  it('(12c) pre-final and penultimate map to year 3', () => {
    expect(parseEligibilityScore('pre-final year students', 3)).toBe(1.0);
    expect(parseEligibilityScore('penultimate year', 3)).toBe(1.0);
  });

  it('(13) adjacent year returns 0.5', () => {
    // Student is year 2; eligibility says 3rd year
    expect(parseEligibilityScore('Open to 3rd year students', 2)).toBe(0.5);
    expect(parseEligibilityScore('1st year or 2nd year', 3)).toBe(0.5);
  });

  it('(14) unknown or unparseable eligibility returns 0.8', () => {
    expect(parseEligibilityScore(null, 2)).toBe(0.8);
    expect(parseEligibilityScore('', 2)).toBe(0.8);
    expect(parseEligibilityScore('All engineering branches welcome', 2)).toBe(0.8);
    expect(parseEligibilityScore('Open to all years', 2)).toBe(0.8);
  });

  it('(15) clearly ineligible (student year far from all mentioned years) returns 0.0', () => {
    // Student is year 1; eligibility says final year (4) only → distance = 3
    expect(parseEligibilityScore('Only for final year students', 1)).toBe(0.0);
    // Student is year 4; eligibility says 1st year only → distance = 3
    expect(parseEligibilityScore('1st year only', 4)).toBe(0.0);
  });
});

// ---------------------------------------------------------------------------
// Interest tests (16-18)
// ---------------------------------------------------------------------------

describe('Interest — computeInterestScore', () => {
  it('(16) matching interest/domain returns 1.0', () => {
    const score = computeInterestScore(
      'Software Engineering',
      ['Software Engineering', 'Data Science']
    );
    expect(score).toBe(1.0);
  });

  it('(16b) case-insensitive exact match returns 1.0', () => {
    const score = computeInterestScore(
      'software engineering',
      ['Software Engineering']
    );
    expect(score).toBe(1.0);
  });

  it('(17) partial match (substring) returns 0.6', () => {
    // "Machine Learning" is substring of "Machine Learning Engineering"
    const score = computeInterestScore(
      'Machine Learning Engineering',
      ['Machine Learning']
    );
    expect(score).toBe(0.6);
  });

  it('(17b) reverse partial match: domain is shorter but contained in interest', () => {
    const score = computeInterestScore(
      'ML',
      ['Advanced ML techniques']
    );
    expect(score).toBe(0.6);
  });

  it('(18) no interest match returns 0.3', () => {
    const score = computeInterestScore(
      'Finance',
      ['Software Engineering', 'Data Science']
    );
    expect(score).toBe(0.3);
  });

  it('(18b) null domain name returns 0.3', () => {
    const score = computeInterestScore(null, ['Software Engineering']);
    expect(score).toBe(0.3);
  });
});

// ---------------------------------------------------------------------------
// 19. Correct application of the locked weights (50 / 25 / 15 / 10)
// ---------------------------------------------------------------------------

describe('Composite score — locked weights', () => {
  it('(19) total = 0.50×skill + 0.25×career + 0.15×eligibility + 0.10×interest', () => {
    // Craft inputs to produce known component values:
    //   skillMatch      = 1.0  (INTERMEDIATE student on INTERMEDIATE req)
    //   careerAlignment = 1.0  (exact domain)
    //   eligibility     = 1.0  (year 2, text says "2nd year")
    //   interest        = 1.0  (exact domain match)
    //   expected total  = 0.50 + 0.25 + 0.15 + 0.10 = 1.0
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'INTERMEDIATE' },
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: '2nd year students',
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);

    expect(scores.skillMatch).toBe(1.0);
    expect(scores.careerAlignment).toBe(1.0);
    expect(scores.eligibility).toBe(1.0);
    expect(scores.interest).toBe(1.0);
    expect(scores.total).toBe(1.0);
  });

  it('(19b) weights contribute correctly for mixed scores', () => {
    // skillMatch      = 0.0  (UNASSESSED)
    // careerAlignment = 0.2  (domain mismatch)
    // eligibility     = 0.8  (null raw → benefit of doubt)
    // interest        = 0.3  (no match)
    // expected total = 0*0.50 + 0.2*0.25 + 0.8*0.15 + 0.3*0.10
    //               = 0 + 0.05 + 0.12 + 0.03 = 0.20
    const skillStates: StudentSkillState[] = [];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_AI,
      domain: { name: 'Artificial Intelligence' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);

    expect(scores.skillMatch).toBe(0.0);
    expect(scores.careerAlignment).toBe(0.2);
    expect(scores.eligibility).toBe(0.8);
    expect(scores.interest).toBe(0.3);
    expect(scores.total).toBeCloseTo(0.2, 3);
  });

  it('(19c) validates the documented example from spec Section 24.1', () => {
    // From spec comment: skill 1.0 * 0.50 = 0.50
    //                    career 1.0 * 0.25 = 0.25
    //                    eligibility 0.8 * 0.15 = 0.12  (open = benefit of doubt)
    //                    interest 1.0 * 0.10 = 0.10
    //                    total = 0.97
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'INTERMEDIATE' }, // INTERMEDIATE=3 vs required INTERMEDIATE=3 → 1.0
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: 'Open to all years', // no year found → 0.8
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);

    expect(scores.skillMatch).toBe(1.0);
    expect(scores.careerAlignment).toBe(1.0);
    expect(scores.eligibility).toBe(0.8);
    expect(scores.interest).toBe(1.0);
    // 0.50 + 0.25 + 0.12 + 0.10 = 0.97
    expect(scores.total).toBeCloseTo(0.97, 2);
  });
});

// ---------------------------------------------------------------------------
// 20. Final score is rounded to 3 decimal places
// ---------------------------------------------------------------------------

describe('Final score rounding', () => {
  it('(20) total is rounded to 3 decimal places', () => {
    // Use BEGINNER (2) on INTERMEDIATE (3) req: contribution = 2/3 = 0.666...
    // skillMatch = 0.667 (3dp)
    // careerAlignment = 0.6 (null domain)
    // eligibility = 0.8 (null raw)
    // interest = 0.3 (no match — domain is null)
    // total = 0.667*0.50 + 0.6*0.25 + 0.8*0.15 + 0.3*0.10
    //       = 0.3335 + 0.15 + 0.12 + 0.03 = 0.6335 → rounded 0.634
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'BEGINNER' },
    ];
    const opp: OpportunityWithTags = {
      domainId: null,
      domain: null,
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);

    // Verify it is rounded to exactly 3 decimal places
    const asString = scores.total.toString();
    const decimalPart = asString.includes('.') ? asString.split('.')[1] : '';
    expect(decimalPart!.length).toBeLessThanOrEqual(3);

    // Spot-check the value: 2/3 * 0.5 + 0.6*0.25 + 0.8*0.15 + 0.3*0.1
    // = 0.3333... + 0.15 + 0.12 + 0.03 = 0.6333... → 0.633
    expect(scores.total).toBeCloseTo(0.633, 2);
  });

  it('(20b) each component score is also rounded to 3 decimal places', () => {
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'BEGINNER' }, // 2/3 = 0.6666...
    ];
    const opp: OpportunityWithTags = {
      domainId: DOMAIN_SWE,
      domain: { name: 'Software Engineering' },
      eligibilityRaw: null,
      skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 1.0 },
      ],
    };

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);

    // skillMatch = 0.667 (round(2/3 * 1000) / 1000)
    expect(scores.skillMatch).toBe(0.667);
  });
});

// ---------------------------------------------------------------------------
// Additional robustness / edge-case tests
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('returns valid scores when student has more skills than the opportunity requires', () => {
    // Student has 3 skills, opportunity only needs 1
    const skillStates: StudentSkillState[] = [
      { skillId: SKILL_PYTHON, assessedLevel: 'EXPERT' },
      { skillId: SKILL_SQL,    assessedLevel: 'PROFICIENT' },
      { skillId: SKILL_DOCKER, assessedLevel: 'BEGINNER' },
    ];
    const opp = makeOpportunity(SKILL_PYTHON, 1.0);

    const scores = computeCompatibilityScore(skillStates, baseRoleSkills, opp, baseProfile);
    expect(scores.skillMatch).toBe(1.0);
    expect(scores.total).toBeGreaterThan(0);
    expect(scores.total).toBeLessThanOrEqual(1.0);
  });

  it('all returned scores are in [0.0, 1.0]', () => {
    const profiles: StudentProfileContext[] = [
      { selectedDomainId: DOMAIN_SWE, yearOfStudy: 1, interests: [] },
      { selectedDomainId: null,        yearOfStudy: 4, interests: ['Finance'] },
      { selectedDomainId: DOMAIN_AI,   yearOfStudy: 2, interests: ['Software Engineering'] },
    ];

    const opps: OpportunityWithTags[] = [
      { domainId: null,       domain: null, eligibilityRaw: null, skillTags: [] },
      { domainId: DOMAIN_SWE, domain: { name: 'Software Engineering' }, eligibilityRaw: 'final year', skillTags: [] },
      { domainId: DOMAIN_AI,  domain: { name: 'AI' }, eligibilityRaw: '2nd year', skillTags: [
        { skillId: SKILL_PYTHON, skill: { name: 'Python' }, confidence: 0.8 },
      ] },
    ];

    for (const profile of profiles) {
      for (const opp of opps) {
        const scores = computeCompatibilityScore([], baseRoleSkills, opp, profile);
        expect(scores.skillMatch).toBeGreaterThanOrEqual(0.0);
        expect(scores.skillMatch).toBeLessThanOrEqual(1.0);
        expect(scores.careerAlignment).toBeGreaterThanOrEqual(0.0);
        expect(scores.careerAlignment).toBeLessThanOrEqual(1.0);
        expect(scores.eligibility).toBeGreaterThanOrEqual(0.0);
        expect(scores.eligibility).toBeLessThanOrEqual(1.0);
        expect(scores.interest).toBeGreaterThanOrEqual(0.0);
        expect(scores.interest).toBeLessThanOrEqual(1.0);
        expect(scores.total).toBeGreaterThanOrEqual(0.0);
        expect(scores.total).toBeLessThanOrEqual(1.0);
      }
    }
  });

  it('PROFICIENCY_SCORES constant is correctly defined', () => {
    expect(PROFICIENCY_SCORES['UNASSESSED']).toBe(0);
    expect(PROFICIENCY_SCORES['AWARENESS']).toBe(1);
    expect(PROFICIENCY_SCORES['BEGINNER']).toBe(2);
    expect(PROFICIENCY_SCORES['INTERMEDIATE']).toBe(3);
    expect(PROFICIENCY_SCORES['PROFICIENT']).toBe(4);
    expect(PROFICIENCY_SCORES['EXPERT']).toBe(5);
  });

  it('DEFAULT_REQUIRED_PROFICIENCY_SCORE equals INTERMEDIATE (3)', () => {
    expect(DEFAULT_REQUIRED_PROFICIENCY_SCORE).toBe(3);
  });
});
