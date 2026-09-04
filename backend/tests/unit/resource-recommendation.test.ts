import { ResourceRecommendationService, type ResourceRepository, type RoadmapRepository } from '../../src/modules/recommendation/resource-recommendation.service';
import type { RoadmapSkillState, ResourceItem } from '../../src/modules/recommendation/recommendation.types';

describe('ResourceRecommendationService', () => {
  let mockResourceRepo: jest.Mocked<ResourceRepository>;
  let mockRoadmapRepo: jest.Mocked<RoadmapRepository>;
  let service: ResourceRecommendationService;

  beforeEach(() => {
    mockResourceRepo = {
      findResourcesBySkillId: jest.fn(),
    };
    mockRoadmapRepo = {
      getStudentRoadmap: jest.fn(),
    };
    service = new ResourceRecommendationService(mockResourceRepo, mockRoadmapRepo);
  });

  const mockRoadmap: RoadmapSkillState[] = [
    {
      skillId: 'skill-1',
      skillName: 'TypeScript',
      status: 'NOT_STARTED',
      sequence: 10,
      currentProficiency: 'BEGINNER',
      targetProficiency: 'INTERMEDIATE',
    },
    {
      skillId: 'skill-2',
      skillName: 'React',
      status: 'IN_PROGRESS',
      sequence: 20,
      currentProficiency: 'BEGINNER',
      targetProficiency: 'PROFICIENT',
    },
    {
      skillId: 'skill-3',
      skillName: 'Node.js',
      status: 'COMPLETED',
      sequence: 30,
      currentProficiency: 'PROFICIENT',
      targetProficiency: 'PROFICIENT',
    },
    {
      skillId: 'skill-4',
      skillName: 'Docker',
      status: 'NOT_STARTED',
      sequence: 40,
      currentProficiency: 'UNASSESSED',
      targetProficiency: 'BEGINNER',
    },
    {
      skillId: 'skill-5',
      skillName: 'AWS',
      status: 'IN_PROGRESS',
      sequence: 50,
      currentProficiency: 'UNASSESSED',
      targetProficiency: 'INTERMEDIATE',
    },
    {
      skillId: 'skill-6',
      skillName: 'GraphQL',
      status: 'NOT_STARTED',
      sequence: 60,
      currentProficiency: null,
      targetProficiency: 'BEGINNER',
    },
    {
      skillId: 'skill-7',
      skillName: 'Prisma',
      status: 'NOT_STARTED',
      sequence: 70,
      currentProficiency: 'BEGINNER',
      targetProficiency: 'INTERMEDIATE',
    }
  ];

  const mockResourcesSkill1: ResourceItem[] = [
    { id: 'r1', title: 'Paid TS Course', url: 'http://paid', type: 'COURSE', isFree: false, provider: 'Udemy' },
    { id: 'r2', title: 'Free TS Docs', url: 'http://docs', type: 'ARTICLE', isFree: true, provider: 'Microsoft' },
    { id: 'r3', title: 'A Free Book', url: 'http://book', type: 'BOOK', isFree: true, provider: null },
  ];

  it('should return resources for a specific skillId if provided', async () => {
    mockRoadmapRepo.getStudentRoadmap.mockResolvedValue(mockRoadmap);
    mockResourceRepo.findResourcesBySkillId.mockResolvedValue(mockResourcesSkill1);

    const result = await service.getResourceRecommendations('student-1', 'skill-1');

    expect(result.skillResources).toHaveLength(1);
    expect(result.skillResources[0].skillId).toBe('skill-1');
    // Verify resource sorting: Free first, then alphabetical by title
    expect(result.skillResources[0].resources[0].id).toBe('r3'); // A Free Book
    expect(result.skillResources[0].resources[1].id).toBe('r2'); // Free TS Docs
    expect(result.skillResources[0].resources[2].id).toBe('r1'); // Paid TS Course
  });

  it('should ignore unrelated skills when specific skillId is provided', async () => {
    mockRoadmapRepo.getStudentRoadmap.mockResolvedValue(mockRoadmap);
    
    const result = await service.getResourceRecommendations('student-1', 'skill-999');

    expect(result.skillResources).toHaveLength(0);
    expect(mockResourceRepo.findResourcesBySkillId).not.toHaveBeenCalled();
  });

  it('should return up to 5 priority skills when no skillId is provided', async () => {
    mockRoadmapRepo.getStudentRoadmap.mockResolvedValue(mockRoadmap);
    mockResourceRepo.findResourcesBySkillId.mockResolvedValue([]);

    const result = await service.getResourceRecommendations('student-1');

    expect(result.skillResources).toHaveLength(5);
    
    // Check correct priority skills: NOT_STARTED or IN_PROGRESS, ordered by sequence
    expect(result.skillResources[0].skillId).toBe('skill-1'); // seq 10
    expect(result.skillResources[1].skillId).toBe('skill-2'); // seq 20
    expect(result.skillResources[2].skillId).toBe('skill-4'); // seq 40 (skill-3 skipped because COMPLETED)
    expect(result.skillResources[3].skillId).toBe('skill-5'); // seq 50
    expect(result.skillResources[4].skillId).toBe('skill-6'); // seq 60
    
    // skill-7 should be omitted due to max 5 limit
    const skill7 = result.skillResources.find(s => s.skillId === 'skill-7');
    expect(skill7).toBeUndefined();
  });

  it('should handle skills with no resources correctly', async () => {
    mockRoadmapRepo.getStudentRoadmap.mockResolvedValue(mockRoadmap);
    mockResourceRepo.findResourcesBySkillId.mockResolvedValue([]);

    const result = await service.getResourceRecommendations('student-1', 'skill-1');

    expect(result.skillResources).toHaveLength(1);
    expect(result.skillResources[0].skillId).toBe('skill-1');
    expect(result.skillResources[0].resources).toHaveLength(0);
  });

  it('should return empty list if student roadmap has no priority skills', async () => {
    mockRoadmapRepo.getStudentRoadmap.mockResolvedValue([
      { ...mockRoadmap[2] } // Only completed skill
    ]);

    const result = await service.getResourceRecommendations('student-1');

    expect(result.skillResources).toHaveLength(0);
  });
});
