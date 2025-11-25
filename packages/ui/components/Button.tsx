import { useKeyboard } from "../src/useKeyboard";
import type { ReactNode } from "react";
import { Text, Pressable } from "react-native";

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

  useKeyboard((key) => {
    if (!shortcut || !onPress) return;
    if (key.name == shortcut) onPress();
  });

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
