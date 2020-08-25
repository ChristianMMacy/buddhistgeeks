import { useState, useRef } from "react"
import h from 'react-hyperscript'
import { useDiscounts } from "src/data"
import { CreateDiscountMsg, CreateDiscountResult } from "pages/api/courses/[id]/discounts"
import { useApi } from "src/apiHelpers"
import { Box, FormBox, LabelBox } from "components/Layout"
import { Input, CheckBox, Radio } from "components/Form"
import { PageLoader } from "components/Loader"
import { Primary, Secondary, Destructive } from "components/Button"
import { course_discounts } from "@prisma/client"
import { DeleteDiscountResult } from "pages/api/discounts/[code]"

export function Discounts(props: {course:number}) {
  let {data: discounts, mutate} = useDiscounts(props.course)
  let [newDiscount, setNewDiscount] = useState<CreateDiscountMsg & {limited_uses: boolean}>({
    name: '',
    type: "absolute",
    limited_uses: false,
    amount: 0,
    max_redeems: undefined
  })
  let [status, callCreateDiscount] = useApi<CreateDiscountMsg, CreateDiscountResult>([newDiscount, mutate], (res)=>{
    if(!discounts) return
    mutate(discounts.concat([res]))
  })
  let onSubmit = (e:React.FormEvent) => {
    e.preventDefault()
    callCreateDiscount(`/api/courses/${props.course}/discounts`, newDiscount)
  }
  return h(Box, {gap:32}, [
    h('h2', "Discounts"),
    h(FormBox, {onSubmit, width: 400}, [
      h(LabelBox, {gap:8}, [
        h('h4', "Discount Name"),
        h(Input, {
          type: 'text',
          required: true,
          value: newDiscount.name,
          onChange:e =>setNewDiscount({...newDiscount, name: e.currentTarget.value})
        })
      ]),
      h(Box, {h: true, gap:64}, [
        h(LabelBox, {gap:8}, [
          h('h4', "Type"),
          h('div', {style: {alignSelf: 'center', padding: '13px 0px'}}, [
            h(Radio, {
              h: true,
              name: 'type',
              selected: newDiscount.type,
              onChange: (value) => {
                setNewDiscount({...newDiscount, type: value as typeof newDiscount.type})
              },
              items: [
                {value: "percentage", component: h('span', '%')},
                {value: 'absolute', component: h('span', "$")}
              ]
            })
          ])
        ]),
        h(LabelBox, {gap:8}, [
          h('h4', "Amount Off"),
          h(Input, {
            type: 'number',
            value: newDiscount.amount,
            onChange: e=>setNewDiscount({...newDiscount, amount: parseInt(e.currentTarget.value)})
          })
        ])
      ]),
      h(LabelBox, {gap: 8}, [
        h(CheckBox, [
          h(Input, {
            type: 'checkbox',
            checked: newDiscount.limited_uses,
            onChange: e => setNewDiscount({...newDiscount, limited_uses: e.currentTarget.checked})
          }),
          "Limit uses of this discount code"
        ])
      ]),
      newDiscount.limited_uses ? h(LabelBox,  {gap: 8}, [
        h('h4', 'Max uses'),
        h(Input, {
          type: 'number',
          value: newDiscount.max_redeems,
          onChange: e=> {
            setNewDiscount({...newDiscount, max_redeems: parseInt(e.currentTarget.value)})
          }
        })
      ]) : null,
      h(Primary, {type: 'submit', status}, "Create New Discount")
    ]),
    !discounts
      ? h(PageLoader)
      : h(Box, {gap: 32}, discounts.map(discount => h('div', [
        h(DiscountItem, {discount, delete:()=>{
          if(!discounts) return
          mutate(discounts.filter(d=>d.code !== discount.code))
        }})
      ])))
  ])
}

function DiscountItem(props: {discount: course_discounts, delete: ()=>void}) {
  let ref = useRef<HTMLInputElement | null>(null)
  let [status, callDelete] = useApi<null, DeleteDiscountResult>([props], props.delete)
  return h(Box, {gap: 8}, [
    h('h3', props.discount.name),
    h('div', [
      h('span.textSecondary', `${props.discount.type === 'absolute' ? "$"+props.discount.amount : props.discount.amount+'%'} off`),
      h('span.textSecondary', ` | Redeemed ${props.discount.max_redeems===0 ? props.discount.redeems : `${props.discount.redeems}/${props.discount.max_redeems}`} times`)
    ]),
    h(Box, {h: true, style: {alignItems: 'center'}}, [
      h(Input, {
        onFocus: e =>{
          e.currentTarget.selectionEnd = e.currentTarget.value.length
        },
        style: {width: '360px', textDecoration: 'underline', color: 'blue'},
        readOnly: true,
        value: `https://hyperlink.academy/discount?discount=${props.discount.code}`,
        ref: ref
      }),
      h(Secondary, {
        onClick: e =>{
          e.preventDefault()
          if(!ref.current) return
          ref.current.select()
          document.execCommand('copy')
          ref.current.selectionEnd  = ref.current.selectionStart
          ref.current.blur()
        }
      }, 'Copy' ),
      h(Destructive, {
        status,
        onClick: e =>{
          e.preventDefault()
          callDelete('/api/discounts/'+props.discount.code, null, "DELETE")
        }
      }, "Delete")
    ])
  ])
}
