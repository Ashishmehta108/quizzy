/**
 * @layer service
 * @owner agent-3
 * @tables courses, student_groups, workspaces
 */
import { CourseRepository } from "../repositories/course.repository";
import { StudentGroupRepository } from "../repositories/student-group.repository";

const courseRepo = new CourseRepository();
const groupRepo = new StudentGroupRepository();

export class CourseManagementService {
  async listCourses(workspaceId: string) {
    return await courseRepo.listCoursesByWorkspace(workspaceId);
  }

  async createCourse(workspaceId: string, title: string, description?: string) {
    return await courseRepo.createCourse({ workspaceId, title, description });
  }

  async getCourse(id: string) {
    return await courseRepo.getCourseById(id);
  }

  // Student Groups (Cohorts)
  async createGroup(workspaceId: string, name: string, description?: string) {
    return await groupRepo.createGroup({ workspaceId, name, description });
  }

  async listGroups(workspaceId: string) {
    return await groupRepo.listGroupsByWorkspace(workspaceId);
  }
}
