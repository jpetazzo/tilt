import React, { PropsWithChildren, useContext, useState } from "react"
import styled from "styled-components"
import { ReactComponent as PinResourceFilledSvg } from "./assets/svg/pin-resource-filled.svg"
import { Color, Height, Width } from "./style-helpers"
import { SidebarItemStyle } from "./SidebarItem"
import { incr } from "./analytics"

let UnpinnedPinIcon = styled(PinResourceFilledSvg)`
  fill: ${Color.grayLight};
  display: none;
  ${SidebarItemStyle}:hover & {
    display: flex;
  }
`
let PinnedPinIcon = styled(PinResourceFilledSvg)`
  fill: ${Color.yellowLight};
`
let PinButton = styled.button`
  float: left;
  cursor: pointer;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: transparent;
  border: 0 none;
  height: ${Height.sidebarItem}px;
  width: ${Width.sidebarPinButton}px;
  display: inline;
  align-items: center;
  justify-content: center;
`

type SidebarPinContext = {
  pinnedResources: string[]
  pinResource: (name: string) => void
  unpinResource: (name: string) => void
}

export const sidebarPinContext = React.createContext<SidebarPinContext>({
  pinnedResources: [],
  pinResource: s => {},
  unpinResource: s => {},
})

export function SidebarPinContextProvider(
  props: PropsWithChildren<{ initialValue?: Array<string> }>
) {
  const [pinnedResources, setPinnedResources] = useState<Array<string>>(
    props.initialValue ?? []
  )

  function pinResource(name: string) {
    setPinnedResources(prevState => {
      const ret = prevState.includes(name) ? prevState : [...prevState, name]
      incr("ui.web.pin", {
        newPinCount: ret.length.toString(),
        action: "pin",
      })
      return ret
    })
  }

  function unpinResource(name: string) {
    setPinnedResources(prevState => {
      const ret = prevState.filter(n => n !== name)
      incr("ui.web.pin", {
        newPinCount: ret.length.toString(),
        action: "unpin",
      })
      return ret
    })
  }

  return (
    <sidebarPinContext.Provider
      value={{ pinnedResources, pinResource, unpinResource }}
    >
      {props.children}
    </sidebarPinContext.Provider>
  )
}

export function SidebarPinButton(props: { resourceName: string }): JSX.Element {
  let ctx = useContext(sidebarPinContext)
  let isPinned =
    ctx.pinnedResources && ctx.pinnedResources.includes(props.resourceName)

  let icon: JSX.Element
  let onClick: (resourceName: string) => void
  let title: string

  if (isPinned) {
    icon = <PinnedPinIcon />
    onClick = ctx.unpinResource
    title = "unpin"
  } else {
    icon = <UnpinnedPinIcon />
    onClick = ctx.pinResource
    title = "pin"
  }

  return (
    <PinButton title={title} onClick={() => onClick(props.resourceName)}>
      {icon}
    </PinButton>
  )
}
