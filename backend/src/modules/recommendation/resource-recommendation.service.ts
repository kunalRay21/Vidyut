import type { 
  RoadmapSkillState, 
  ResourceItem, 
  ResourceRecommendation, 
  ResourceRecommendationResponse 
} from './recommendation.types';

export interface ResourceRepository {
  findResourcesBySkillId(skillId: string): Promise<ResourceItem[]>;
}

export interface RoadmapRepository {
  getStudentRoadmap(studentId: string): Promise<RoadmapSkillState[]>;
}

export class ResourceRecommendationService {
  constructor(
    private resourceRepository: ResourceRepository,
    private roadmapRepository: RoadmapRepository
  ) {}

  /**
   * Generates deterministic learning-resource recommendations based on the student's 
   * priority skill gaps.
   * 
   * @param studentId The ID of the student.
   * @param specificSkillId (Optional) Focus entirely on this skill if provided.
   */
  async getResourceRecommendations(
    studentId: string,
    specificSkillId?: string
  ): Promise<ResourceRecommendationResponse> {
    const roadmap = await this.roadmapRepository.getStudentRoadmap(studentId);
    
    let targetSkills: RoadmapSkillState[] = [];

    if (specificSkillId) {
      // Case A: specific skillId supplied
      const foundSkill = roadmap.find(s => s.skillId === specificSkillId);
      if (foundSkill) {
        targetSkills.push(foundSkill);
      }
    } else {
      // Case B: no skillId supplied
      targetSkills = roadmap
        .filter(s => s.status === 'NOT_STARTED' || s.status === 'IN_PROGRESS')
        // Determine ordering based on sequence
        .sort((a, b) => a.sequence - b.sequence)
        // Select top 5 priority skills
        .slice(0, 5);
    }

    const skillResources: ResourceRecommendation[] = [];

    for (const skillState of targetSkills) {
      const resources = await this.resourceRepository.findResourcesBySkillId(skillState.skillId);
      
      // Deterministic resource ranking
      // 1. isFree = true before isFree = false
      // 2. secondary ordering: alphabetical by title to guarantee stable ordering
      const sortedResources = [...resources].sort((a, b) => {
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.title.localeCompare(b.title);
      });

      skillResources.push({
        skillId: skillState.skillId,
        skillName: skillState.skillName,
        currentProficiency: skillState.currentProficiency,
        targetProficiency: skillState.targetProficiency,
        resources: sortedResources,
      });
    }

    return {
      skillResources,
    };
  }
}
