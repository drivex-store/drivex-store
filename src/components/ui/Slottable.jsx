
import { isValidElement, cloneElement } from 'react'
import { Slot, mergeProps } from '@radix-ui/react-slot'

function renderChildren(props, childData) {
  return typeof props.children === 'function' ? props.children(childData) : props.children
}

export function Slottable(props) {
  const { asChild, child, children, ...restProps } = props

  if (!isValidElement(child)) {
    return asChild ? null : renderChildren(props, child)
  }

  const childProps = child.props

  const resolvedChildren = child.type === Slot || childProps.asChild 
    ? <Slottable asChild={asChild} child={childProps.children}>{children}</Slottable>
    : renderChildren(props, childProps.children)

  return cloneElement(child, mergeProps(childProps, restProps), resolvedChildren)
}