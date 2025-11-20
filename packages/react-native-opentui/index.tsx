import * as React from "react";
import type { ViewProps, TextProps, PressableProps, ScrollViewProps } from "react-native";

export function View({ children, style }: ViewProps) {
  const bg = style &&
    'backgroundColor' in style
    ? typeof style.backgroundColor == 'string'
    ? style.backgroundColor
    : undefined
    : undefined;
  const flexDirection = style &&
    'flexDirection' in style
    ? typeof style.flexDirection == 'string'
    ? style.flexDirection
    : undefined
    : undefined;
  const flex = style &&
    'flex' in style
    ? typeof style.flex == 'number'
    ? style.flex
    : undefined
    : undefined;
  const flexShrink = style &&
    'flexShrink' in style
    ? typeof style.flexShrink == 'number'
    ? style.flexShrink
    : undefined
    : undefined;
  const overflow = style &&
    'overflow' in style
    ? typeof style.overflow == 'string'
    ? style.overflow
    : undefined
    : undefined;

  return <box
    backgroundColor={bg}
    flexDirection={flexDirection}
    flexGrow={flex}
    overflow={overflow}
    flexShrink={flexShrink}
  >{children}</box>
}

export function Pressable({ children: childrenRaw, style, onPress }: PressableProps) {
  const bg = style &&
    'backgroundColor' in style
    ? typeof style.backgroundColor == 'string'
    ? style.backgroundColor
    : undefined
    : undefined;
  const flexDirection = style &&
    'flexDirection' in style
    ? typeof style.flexDirection == 'string'
    ? style.flexDirection
    : undefined
    : undefined;
  const flex = style &&
    'flex' in style
    ? typeof style.flex == 'number'
    ? style.flex
    : undefined
    : undefined;

  const children = childrenRaw instanceof Function ? childrenRaw({ pressed: true }) : childrenRaw;

  return <box
    backgroundColor={bg}
    flexDirection={flexDirection}
    flexGrow={flex}
    onMouseDown={onPress ? ((_event) => {
      // @ts-ignore
      onPress();
    }) : undefined}
  >{children}</box>
}


export function Text({ style, children }: TextProps) {
  const fg = style &&
    'color' in style
    ? typeof style.color == 'string'
    ? style.color
    : undefined
    : undefined;
  return <text fg={fg || "black"}>{children}</text>

}

export function ScrollView({ children }: ScrollViewProps) {
  return <scrollbox >{children}</scrollbox>
}

export const Platform = {
  OS: "tui",
};

export default {
  View,
  Text,
}
