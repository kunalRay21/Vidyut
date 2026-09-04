import { 
  PrismaProfileService, 
  PrismaOpportunityRepository,
  PrismaRecommendationPersistenceClient,
  PrismaResourceRepository,
  PrismaRoadmapRepository
} from '../../src/modules/recommendation/recommendation.adapters';
import { prisma } from '../../src/database/prisma';

// Mock the global PrismaClient
jest.mock('../../src/database/prisma', () => ({
  prisma: {
    studentProfile: { findUnique: jest.fn() },
    studentSkillState: { findMany: jest.fn() },
    opportunity: { findMany: jest.fn() },
    recommendation: { upsert: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
    resource: { findMany: jest.fn() },
    milestone: { findMany: jest.fn() }
  }
}));

describe('Role 5 Prisma Adapters', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PrismaProfileService', () => {
    const profileService = new PrismaProfileService();

    it('getProfile fetches profile with relations and maps to StudentProfile', async () => {
      const mockDbProfile = {
        id: '123',
        yearOfStudy: 3,
        interests: ['AI', 'Web'],
        selectedRole: {
          domainId: 'd1',
          domain: { name: 'Engineering' }
        }
      };
      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue(mockDbProfile);

      const profile = await profileService.getProfile('123');

      expect(prisma.studentProfile.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: { selectedRole: { include: { domain: true } } }
      });
      expect(profile).toEqual({
        id: '123',
        yearOfStudy: 3,
        interests: ['AI', 'Web'],
        selectedDomainId: 'd1',
        selectedDomainName: 'Engineering'
      });
    });

    it('getSkillStates fetches and maps skill states', async () => {
      (prisma.studentSkillState.findMany as jest.Mock).mockResolvedValue([
        { skillId: 's1', assessedLevel: 'BEGINNER' },
        { skillId: 's2', assessedLevel: null }
      ]);

      const states = await profileService.getSkillStates('123');
      expect(prisma.studentSkillState.findMany).toHaveBeenCalledWith({ where: { studentId: '123' } });
      expect(states).toEqual([
        { skillId: 's1', assessedLevel: 'BEGINNER' },
        { skillId: 's2', assessedLevel: null }
      ]);
    });
  });

  describe('PrismaOpportunityRepository', () => {
    const oppRepo = new PrismaOpportunityRepository();

    it('findAllActive fetches active opportunities with tags and domain', async () => {
      (prisma.opportunity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'o1',
          title: 'Internship',
          organization: 'Tech',
          type: 'INTERNSHIP',
          mode: 'REMOTE',
          originalUrl: 'url',
          deadline: null,
          stipend: null,
          source: 'DIRECT',
          location: null,
          domainId: 'd1',
          domain: { name: 'Domain 1' },
          eligibilityRaw: null,
          skillTags: [
            { skillId: 's1', skill: { name: 'React' }, weight: 1.0, minProficiency: 'INTERMEDIATE' }
          ]
        }
      ]);

      const opps = await oppRepo.findAllActive();

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { domain: true, skillTags: { include: { skill: true } } }
      });
      expect(opps[0].title).toBe('Internship');
      expect(opps[0].domain?.name).toBe('Domain 1');
      expect(opps[0].skillTags[0].skill.name).toBe('React');
    });
  });

  describe('PrismaRecommendationPersistenceClient', () => {
    const client = new PrismaRecommendationPersistenceClient();

    it('upsert delegates to prisma', async () => {
      (prisma.recommendation.upsert as jest.Mock).mockResolvedValue({ id: 'r1' });
      await client.recommendation.upsert({ where: {} as any, create: {} as any, update: {} as any });
      expect(prisma.recommendation.upsert).toHaveBeenCalled();
    });

    it('findMany delegates to prisma', async () => {
      (prisma.recommendation.findMany as jest.Mock).mockResolvedValue([{ id: 'r1' }]);
      await client.recommendation.findMany({ where: {} as any, include: {} as any, orderBy: {} as any });
      expect(prisma.recommendation.findMany).toHaveBeenCalled();
    });
  });

  describe('PrismaResourceRepository', () => {
    const resourceRepo = new PrismaResourceRepository();

    it('findResourcesBySkillId fetches resources', async () => {
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'r1', title: 'Course', url: 'x', type: 'Video', isFree: true, provider: null }
      ]);
      const res = await resourceRepo.findResourcesBySkillId('s1');
      expect(prisma.resource.findMany).toHaveBeenCalledWith({ where: { skillId: 's1' } });
      expect(res[0].id).toBe('r1');
    });
  });

  describe('PrismaRoadmapRepository', () => {
    const roadmapRepo = new PrismaRoadmapRepository();

    it('getStudentRoadmap fetches milestones and maps to RoadmapSkillState', async () => {
      (prisma.milestone.findMany as jest.Mock).mockResolvedValue([
        {
          skillId: 's1',
          status: 'LOCKED',
          milestoneOrder: 1,
          skill: {
            name: 'Python',
            skillStates: [{ assessedLevel: 'BEGINNER', targetLevel: 'PROFICIENT' }]
          }
        },
        {
          skillId: 's2',
          status: 'IN_PROGRESS',
          milestoneOrder: 2,
          skill: {
            name: 'React',
            skillStates: []
          }
        }
      ]);

      const roadmap = await roadmapRepo.getStudentRoadmap('123');

      expect(prisma.milestone.findMany).toHaveBeenCalledWith({
        where: { roadmap: { studentId: '123' }, skillId: { not: null } },
        include: { skill: { include: { skillStates: { where: { studentId: '123' } } } } },
        orderBy: { milestoneOrder: 'asc' }
      });
      expect(roadmap[0]).toEqual({
        skillId: 's1',
        skillName: 'Python',
        status: 'NOT_STARTED',
        sequence: 1,
        currentProficiency: 'BEGINNER',
        targetProficiency: 'PROFICIENT'
      });
      expect(roadmap[1]).toEqual({
        skillId: 's2',
        skillName: 'React',
        status: 'IN_PROGRESS',
        sequence: 2,
        currentProficiency: null,
        targetProficiency: 'PROFICIENT'
      });
    });
  });
});
