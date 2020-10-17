import { ResultType, APIHandler, Request} from '../../../../src/apiHelpers'
import { getToken } from '../../../../src/token'
import { PrismaClient } from '@prisma/client'
import { updateCategory, updateGroup } from '../../../../src/discourse'
import { slugify } from 'src/utils'

const prisma = new PrismaClient()

export type UpdateCourseMsg = Partial<{
  invite_only: boolean,
  cost: number,
  cohort_max_size: number,
  name: string,
  status: "live",
  prerequisites?: string
  duration?: string
  description: string
}>
export type UpdateCourseResponse = ResultType<typeof updateCourse>
export type CourseDataResult = ResultType<typeof getCourseData>

export default APIHandler({POST: updateCourse, GET:getCourseData})

async function updateCourse(req: Request) {
  let msg = req.body as Partial<UpdateCourseMsg>
  let courseId = parseInt(req.query.id as string)
  if(Number.isNaN(courseId)) return {status: 400, result: "ERROR: Course id is not a number"} as const
  let user = getToken(req)
  if(!user) return {status: 403, result: "ERROR: No user logged in"} as const
  let course = await prisma.courses.findOne({
    where:{id: courseId},
    select: {
      status: true,
      name: true,
      category_id: true,
      maintainer_groupTodiscourse_groups: true,
      course_groupTodiscourse_groups: true,
      course_maintainers: {where: {maintainer: user.id}},
      course_cohorts: {
        select: {
          discourse_groups: true,
          name: true,
        }
      }
    }
  })
  if(!course || course.course_maintainers.length === 0) return {
    status: 403,
    result: `ERROR: user is not maintainer of course ${courseId}`
  } as const

  if(msg.description && msg.description.length > 200) return {status: 400, result: "ERROR: description must be less than 200 characters"} as const
  if(msg.name && msg.name.length > 50) return {status: 400, result: "ERROR: name must be less than 50 characters"} as const

  let slug: string | undefined
  if(msg.name) {
    slug = slugify(msg.name)
    await Promise.all([
      updateGroup(course.maintainer_groupTodiscourse_groups.name, slug+'-m'),
      updateCategory(course.category_id, {
        name: msg.name,
        slug: slug
      }),
      updateGroup(course.course_groupTodiscourse_groups.name, slug),
      ...course.course_cohorts.map(cohort => updateGroup(cohort.discourse_groups.name, slug+'-'+cohort.name))
    ])
  }

  let newData = await prisma.courses.update({
    where: {id: courseId},
    data: {
      slug,
      invite_only: msg.invite_only,
      cohort_max_size: msg.cohort_max_size,
      duration: msg.duration,
      status: msg.status,
      prerequisites: msg.prerequisites,
      description: msg.description,
      cost: msg.cost,
      name: msg.name
    }
  })

  return {status: 200, result: newData} as const
}

export const courseDataQuery = (id:number) => prisma.courses.findOne({
  where: {id},
  include: {
    course_maintainers: {
      include: {
        people: {select: {display_name: true, username: true, link: true, bio: true}}
      }
    },
    course_templates: true,
    course_cohorts: {
      include: {
        courses: {
          select: {
            name: true
          }
        },
        people: {
          select: {
            display_name: true,
            username: true
          }
        },
        people_in_cohorts: {
          select: {
            people: {
              select: {
                id: true
              }
            }
          }
        }
      }
    }
  }
})

async function getCourseData(req: Request) {
  let id = parseInt(req.query.id as string)
  if(Number.isNaN(id) ) return {status: 400, result: "ERROR: Course id is not a number"} as const
  let data = await courseDataQuery(id)

  if(!data) return {status: 403, result: `ERROR: no course with id ${id} found`} as const
  return {status:200, result: data} as const
}
