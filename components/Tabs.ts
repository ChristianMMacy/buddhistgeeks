import { useState, ReactElement} from 'react'
import h from 'react-hyperscript'
import styled from '@emotion/styled'

import {Box} from './Layout'

type Props = {
  tabs: {
    [key: string]: ReactElement | null
  }
}
export const Tabs = (props:Props) => {
  let tabs = Object.keys(props.tabs).filter(tab => props.tabs[tab] !== null)
  let [nav, setNav] = useState(tabs[0])

  return h(Box, {gap: 32}, [
    h(Nav, tabs.map(tab => h(Tab, {
      active: nav === tab,
      onClick: ()=> setNav(tab)
    }, tab))),
    props.tabs[nav]
  ])
}

const Nav = styled('div')`
display: grid;
grid-gap: 32px;
grid-auto-columns: max-content;
grid-auto-flow: column;
grid-template-rows: auto;
border-bottom: 3px solid;
`

const Tab = styled('h4')<{active:boolean}>`
padding-bottom: 4px;
margin-bottom: 2px;
font-weight: bold;

&:hover {
cursor: pointer;
}

${props => props.active ? 'color: blue' : ''};
${props => props.active ? 'border-bottom: 4px solid' : ''};
`.withComponent('a')
