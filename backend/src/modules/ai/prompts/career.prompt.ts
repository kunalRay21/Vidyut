import type { CareerExplanationInput } from '../ai.types';

export function buildCareerPrompt(input: CareerExplanationInput): string {
  return `Explain the following career domain for a college student exploring careers.

Domain Name: ${input.domainName}
Associated Roles: ${input.roles.join(', ') || 'None specified'}
Top Technologies: ${input.topTechnologies.join(', ') || 'None specified'}

Requirements:
- The explanation must be approximately 3 sentences long.
- Use plain language. Avoid buzzwords.
- Explain what professionals in this domain actually do.
- Mention a concrete real-world impact.
- Do not redefine the application's career taxonomy. Treat the provided roles and technologies as context.

Output ONLY valid JSON matching this schema:
{
  "explanation": "string"
}`;
}
