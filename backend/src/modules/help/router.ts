import { Router, Request, Response } from 'express';
import { HELP_CATEGORIES, HELP_QUESTIONS, matchQuestion } from './helpData';

const helpRouter = Router();

/**
 * GET /api/v1/help/categories
 * Returns all top-level help categories.
 */
helpRouter.get('/categories', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: HELP_CATEGORIES,
  });
});

/**
 * GET /api/v1/help/questions
 * Returns all pre-defined questions, optionally filtered by category or search term.
 */
helpRouter.get('/questions', (req: Request, res: Response) => {
  const { category, q } = req.query;

  let results = [...HELP_QUESTIONS];

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((item) => item.categoryId.toLowerCase() === category.toLowerCase());
  }

  if (q && typeof q === 'string' && q.trim().length > 0) {
    const term = q.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

/**
 * POST /api/v1/help/ask
 * Matches user's query strictly against the pre-defined questions repository.
 */
helpRouter.post('/ask', (req: Request, res: Response) => {
  const { query: queryText } = req.body;

  if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Query string is required.',
      suggestions: HELP_QUESTIONS.slice(0, 4),
    });
  }

  const { matchedQuestion, candidates } = matchQuestion(queryText);

  if (matchedQuestion) {
    return res.json({
      success: true,
      matched: true,
      question: matchedQuestion.question,
      answer: matchedQuestion.answer,
      actionLink: matchedQuestion.actionLink,
      categoryId: matchedQuestion.categoryId,
      relatedQuestions: candidates.map((c) => ({
        id: c.id,
        question: c.question,
        categoryId: c.categoryId,
      })),
    });
  }

  // Not matched: gracefully return pre-defined suggestions
  return res.json({
    success: true,
    matched: false,
    message:
      "I am a guided assistant configured to answer verified questions from Vidyut's official knowledge base only. I couldn't find a direct answer for that query. Please select from one of these related topics below:",
    suggestions: candidates.map((c) => ({
      id: c.id,
      question: c.question,
      categoryId: c.categoryId,
    })),
  });
});

export default helpRouter;
