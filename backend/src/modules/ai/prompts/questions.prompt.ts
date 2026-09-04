import type { AssessmentQuestionInput } from '../ai.types';

export function buildQuestionsPrompt(input: AssessmentQuestionInput): string {
  return `You are generating draft multiple-choice questions for human review by a subject matter expert.
These questions are intended for an assessment platform. Do not invent new skills.

Target Skill: ${input.skillName} (ID: ${input.skillId})
Target Proficiency Level: ${input.proficiencyLevel}
Competency Context: ${input.competencyContext}
Number of Questions: ${input.count}

Requirements:
- Generate exactly ${input.count} questions.
- Each question must be relevant to the Target Skill at the specified Target Proficiency Level.
- Each question must have exactly 4 options.
- Exactly 1 option must be correct (indicated by correctOptionIndex, 0 to 3).
- Provide a brief explanation for why the correct option is correct.

Output ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "questionText": "string",
      "options": ["string", "string", "string", "string"],
      "correctOptionIndex": number,
      "explanation": "string"
    }
  ]
}`;
}
