import type { SkillExtractionInput } from '../ai.types';

export function buildSkillsPrompt(input: SkillExtractionInput): string {
  const maxSkills = input.maxSkills ?? 10;
  // Bound the text length to avoid excessively large prompts
  const boundedText = input.text.slice(0, 10000); 

  return `Extract technical skills explicitly mentioned in the following text.
Do not infer skills that are not reasonably present.
Return an empty array if no technical skills are found.

Constraints:
- Extract up to ${maxSkills} skills.
- "mention": The exact substring from the text referring to the skill.
- "skillName": A concise, normalized name for the skill (e.g., "Python", "React", "AWS").

Source Text:
---
${boundedText}
---

Output ONLY valid JSON matching this schema:
{
  "skills": [
    {
      "mention": "string",
      "skillName": "string"
    }
  ]
}`;
}
