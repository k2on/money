import * as React from "react";
import type {
  ViewProps,
  TextProps,
  PressableProps,
  ScrollViewProps,
  ModalProps,
  StyleProp,
  ViewStyle,
  LinkingImpl,
  TextInputProps,
} from "react-native";
import { useTerminalDimensions } from "@opentui/react";
import { RGBA } from "@opentui/core";
import { platform } from "node:os";
import { exec } from "node:child_process";

const RATIO_WIDTH = 8.433;
const RATIO_HEIGHT = 17;

function attr<K extends keyof ViewStyle>(
  style: StyleProp<ViewStyle>,
  name: K,
  type: "string",
): Extract<ViewStyle[K], string> | undefined;

function attr<K extends keyof ViewStyle>(
  style: StyleProp<ViewStyle>,
  name: K,
  type: "number",
): Extract<ViewStyle[K], number> | undefined;

function attr<K extends keyof ViewStyle>(
  style: StyleProp<ViewStyle>,
  name: K,
  type: "boolean",
): Extract<ViewStyle[K], boolean> | undefined;

function attr<K extends keyof ViewStyle>(
  style: StyleProp<ViewStyle>,
  name: K,
  type: "string" | "number" | "boolean",
) {
  if (!style) return undefined;

  const obj: ViewStyle = Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : (style as ViewStyle);

  const v = obj[name];
  return typeof v === type ? v : undefined;
}

export function View({ children, style }: ViewProps) {
  const bg =
    style && "backgroundColor" in style
      ? typeof style.backgroundColor == "string"
        ? style.backgroundColor.startsWith("rgba(")
          ? (() => {
            const parts = style.backgroundColor.split("(")[1].split(")")[0];
            const [r, g, b, a] = parts.split(",").map(parseFloat);
            return RGBA.fromInts(r, g, b, a * 255);
          })()
          : style.backgroundColor
        : undefined
      : undefined;

  const padding = attr(style, "padding", "number");

  const props = {
    overflow: attr(style, "overflow", "string"),
    position: attr(style, "position", "string"),
    alignSelf: attr(style, "alignSelf", "string"),
    alignItems: attr(style, "alignItems", "string"),
    justifyContent: attr(style, "justifyContent", "string"),
    flexShrink: attr(style, "flexShrink", "number"),
    flexDirection: attr(style, "flexDirection", "string"),
    top: attr(style, "top", "number"),
    zIndex: attr(style, "zIndex", "number"),
    left: attr(style, "left", "number"),
    right: attr(style, "right", "number"),
    bottom: attr(style, "bottom", "number"),
    flexGrow:
      attr(style, "flex", "number") || attr(style, "flexGrow", "number"),
  };

  return (
    <box
      backgroundColor={bg}
      paddingTop={padding && Math.round(padding / RATIO_HEIGHT)}
      paddingBottom={padding && Math.round(padding / RATIO_HEIGHT)}
      paddingLeft={padding && Math.round(padding / RATIO_WIDTH)}
      paddingRight={padding && Math.round(padding / RATIO_WIDTH)}
      {...props}
    >
      {children}
    </box>
  );
}

export function Pressable({
  children: childrenRaw,
  style,
  onPress,
}: PressableProps) {
  const bg =
    style && "backgroundColor" in style
      ? typeof style.backgroundColor == "string"
        ? style.backgroundColor.startsWith("rgba(")
          ? (() => {
            const parts = style.backgroundColor.split("(")[1].split(")")[0];
            const [r, g, b, a] = parts.split(",").map(parseFloat);
            return RGBA.fromInts(r, g, b, a * 255);
          })()
          : style.backgroundColor
        : undefined
      : undefined;
  const flexDirection =
    style && "flexDirection" in style
      ? typeof style.flexDirection == "string"
        ? style.flexDirection
        : undefined
      : undefined;
  const flex =
    style && "flex" in style
      ? typeof style.flex == "number"
        ? style.flex
        : undefined
      : undefined;
  const flexShrink =
    style && "flexShrink" in style
      ? typeof style.flexShrink == "number"
        ? style.flexShrink
        : undefined
      : undefined;
  const overflow =
    style && "overflow" in style
      ? typeof style.overflow == "string"
        ? style.overflow
        : undefined
      : undefined;
  const position =
    style && "position" in style
      ? typeof style.position == "string"
        ? style.position
        : undefined
      : undefined;
  const justifyContent =
    style && "justifyContent" in style
      ? typeof style.justifyContent == "string"
        ? style.justifyContent
        : undefined
      : undefined;
  const alignItems =
    style && "alignItems" in style
      ? typeof style.alignItems == "string"
        ? style.alignItems
        : undefined
      : undefined;

  const padding =
    style && "padding" in style
      ? typeof style.padding == "number"
        ? style.padding
        : undefined
      : undefined;

  const children =
    childrenRaw instanceof Function
      ? childrenRaw({ pressed: true })
      : childrenRaw;

  return (
    <box
      onMouseDown={
        onPress
          ? (_event) => {
            // @ts-ignore
            onPress();
          }
          : undefined
      }
      backgroundColor={bg}
      flexDirection={flexDirection}
      flexGrow={flex}
      overflow={overflow}
      flexShrink={flexShrink}
      position={position}
      justifyContent={justifyContent}
      alignItems={alignItems}
      paddingTop={padding && Math.round(padding / RATIO_HEIGHT)}
      paddingBottom={padding && Math.round(padding / RATIO_HEIGHT)}
      paddingLeft={padding && Math.round(padding / RATIO_WIDTH)}
      paddingRight={padding && Math.round(padding / RATIO_WIDTH)}
    >
      {children}
    </box>
  );
}

export function Text({ style, children }: TextProps) {
  const fg =
    style && "color" in style
      ? typeof style.color == "string"
        ? style.color
        : undefined
      : undefined;
  return <text fg={fg || "black"}>{children}</text>;
}

export function ScrollView({ children }: ScrollViewProps) {
  return <scrollbox>{children}</scrollbox>;
}

export function Modal({ children, visible }: ModalProps) {
  const { width, height } = useTerminalDimensions();
  return (
    <box
      visible={visible}
      position="absolute"
      width={width}
      height={height}
      zIndex={10}
    >
      {children}
    </box>
  );
}

export function TextInput({
  defaultValue,
  onChangeText,
  onKeyPress,
}: TextInputProps) {
  return (
    <input
      width={20}
      backgroundColor="white"
      textColor="black"
      focused={true}
      cursorColor={"black"}
      onInput={onChangeText}
      onKeyDown={(key) =>
        // @ts-ignore
        onKeyPress({
          nativeEvent: {
            key: key.name == "return" ? "Enter" : key.name,
          },
        })
      }
      placeholder={defaultValue}
    />
  );
}

export const Platform = {
  OS: "tui",
};

export const Linking = {
  openURL: async (url: string) => {
    const cmd =
      platform() == "darwin"
        ? `open ${url}`
        : platform() == "win32"
          ? `start "" "${url}"`
          : `xdg-open "${url}"`;
    exec(cmd);
  },
} satisfies Partial<LinkingImpl>;

export default {
  View,
  Text,
};
