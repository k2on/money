import * as React from "react";
import type { ViewProps, TextProps } from "react-native";

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

  return <box backgroundColor={bg} flexDirection={flexDirection} flexGrow={flex}>{children}</box>

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

export const Platform = {
  OS: "tui",
};

export default {
  View,
  Text,
}
