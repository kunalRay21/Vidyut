import { HELP_CATEGORIES, HELP_QUESTIONS, matchQuestion } from '../../src/modules/help/helpData';

describe('Help Assistant Module', () => {
  it('should have categories with required properties', () => {
    expect(HELP_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    for (const cat of HELP_CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.description).toBeDefined();
    }
  });

  it('should have pre-defined questions covering all categories', () => {
    expect(HELP_QUESTIONS.length).toBeGreaterThanOrEqual(15);
    const categoryIds = new Set(HELP_CATEGORIES.map((c) => c.id));

    for (const q of HELP_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.question).toBeDefined();
      expect(q.answer).toBeDefined();
      expect(categoryIds.has(q.categoryId)).toBe(true);
      expect(Array.isArray(q.tags)).toBe(true);
    }
  });

  it('should accurately match an exact question', () => {
    const query = 'How is my personalized career roadmap generated?';
    const result = matchQuestion(query);

    expect(result.matchedQuestion).not.toBeNull();
    expect(result.matchedQuestion?.id).toBe('rm-1');
  });

  it('should match questions via keywords (e.g. compatibility score formula)', () => {
    const query = 'how compatibility score calculated';
    const result = matchQuestion(query);

    expect(result.matchedQuestion).not.toBeNull();
    expect(result.matchedQuestion?.id).toBe('op-1');
  });

  it('should match questions about free learning resources', () => {
    const query = 'are recommended courses free';
    const result = matchQuestion(query);

    expect(result.matchedQuestion).not.toBeNull();
    expect(result.matchedQuestion?.id).toBe('res-1');
  });

  it('should return suggestions and not hallucinate when an unrelated query is given', () => {
    const query = 'what is the best recipe for baking pizza in oven';
    const result = matchQuestion(query);

    expect(result.matchedQuestion).toBeNull();
    expect(result.candidates.length).toBeGreaterThan(0);
  });
});
