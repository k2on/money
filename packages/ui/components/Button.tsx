import { useEffect, type ReactNode } from "react";
import { Text, Pressable } from "react-native";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: "default" | "secondary" | "destructive";
  shortcut?: string;
}

const STYLES: Record<
  NonNullable<ButtonProps["variant"]>,
  { backgroundColor: string; color: string }
> = {
  default: { backgroundColor: "black", color: "white" },
  secondary: { backgroundColor: "#ccc", color: "black" },
  destructive: { backgroundColor: "red", color: "white" },
};

export function Button({ children, variant, onPress, shortcut }: ButtonProps) {
  const { backgroundColor, color } = STYLES[variant || "default"];

  // if (shortcut) {
  // useKeys((key) => {
  //   if (
  //     typeof shortcut == "object"
  //       ? key.name == shortcut.name
  //       : key.name == shortcut
  //   )
  //     return onPress;
  // });
  // }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor }}>
      <Text style={{ fontFamily: "mono", color }}>
        {" "}
        {children}
        {shortcut && ` (${shortcut})`}{" "}
      </Text>
    </Pressable>
  );
}
