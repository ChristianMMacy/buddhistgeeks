import styled from '@emotion/styled'
import {colors} from './Tokens'
export const Pill = styled('span')<{borderOnly?: boolean}>`
width: fit-content;
font-family: Roboto Mono;
padding: 2px 8px;
font-size: 0.75rem;
border-radius: 4px;
color: ${colors.textSecondary};
${props=> props.borderOnly
? `border: 1px solid ${colors.grey35};`
: `background-color: ${colors.grey90};`
}
`
