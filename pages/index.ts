import h from 'react-hyperscript'
import styled from '@emotion/styled'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { InferGetStaticPropsType } from 'next'
import { useEffect } from 'react'

import Intro from '../writing/Intro.mdx'
import CourseCard, {FlexGrid} from '../components/Course/CourseCard'
import { colors, Mobile} from '../components/Tokens'
import { Box } from '../components/Layout'
import {TitleImg} from '../components/Images'
import { useCourses, useUserData } from '../src/data'
import { coursesQuery } from './api/get/[...item]'

type Props = InferGetStaticPropsType<typeof getStaticProps>
const Landing = (props:Props) => {
  let {data: courses} = useCourses(props)
  let {data: user} = useUserData()
  let router = useRouter()
  useEffect(()=>{
    if(user) router.push('/dashboard')
  }, [user])

  return h(Box, {gap:48}, [
    h(Welcome),
    h('hr'),
    h(Box, {gap: 16}, [
      h('h2', "The Courses List"),
      !courses ? null : h(FlexGrid, {min: 328, mobileMin: 200},
                          courses.courses
                          .map(course => {
                            return h(CourseCard, {
                              key: course.id,
                              id: course.id,
                              description: course.description,
                              start_date: new Date(course.course_instances[0]?.start_date),
                              name: course.name,
                            }, [])
                          })),
    ]),
    h(Box, { padding: 32, style:{backgroundColor: colors.grey95}}, [
      h(Box, {width: 640, ma: true}, [
        h('h2', 'The Course Kindergarten'),
        'The course kindergarten is where we grow new courses. Check out some in development, or propose your own!',
        h('span', {style:{color: 'blue', justifySelf: 'end'}}, [
          h('a.mono',{href: 'https://forum.hyperlink.academy/c/course-kindergarten/'},  'Check out the kindergarten'),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ])
      ])
    ]),
  ])
}

const Welcome = ()=>{
  return h(Box, {gap:32}, [
    h(ImageContainer, [
      h(TitleImg, {width: 1024, src:'/img/landing.png', style: {border: 'none'}}),
    ]),
    h(Box, {ma: true, width: 640}, [
      h(Title, 'hyperlink.academy'),
      h(Intro),
      h(Box, {style:{textAlign: 'right'}}, [
        h('span', {style:{color: 'blue'}}, [
          h(Link,{href: '/manual'}, h('a.mono', 'Read the manual' )),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ]),
        h('span', {style:{color: 'blue'}}, [
          h('a.mono', {href: 'https://forum.hyperlink.academy'}, 'Check out the forum'),
          h('span', {style: {fontSize: '1.25rem'}}, '\u00A0 ➭')
        ]),
      ])
    ]),
  ])
}

export const getStaticProps = async () => {
  let courses = await coursesQuery()
  return {props: {courses}, unstable_revalidate: 1} as const
}

const ImageContainer = styled('div')`
overflow: hidden;
border: 2px solid;
height: 218px;
${Mobile}{overflow-x: scroll};
`

const Title = styled('h1')`
font-family: serif;
font-size: 2.7rem;
text-decoration: underline;
font-weight: bold;
color: blue;
`

export default Landing