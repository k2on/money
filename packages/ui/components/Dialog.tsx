import { createContext, use, type ReactNode } from "react";
import { Modal, View, Text } from "react-native";
import { useShortcut } from "../lib/shortcuts";

export interface DialogState {
  close?: () => void;
}
export const Context = createContext<DialogState>({
  close: () => { },
});

interface ProviderProps {
  children: ReactNode;
  visible?: boolean;
  close?: () => void;
}
export function Provider({ children, visible, close }: ProviderProps) {
  return (
    <Context.Provider value={{ close }}>
      <Modal transparent visible={visible}>
        {/* <Pressable onPress={() => close && close()} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',  }}> */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          {visible && children}
        </View>
      </Modal>
    </Context.Provider>
  );
}

interface ContentProps {
  children: ReactNode;
}
export function Content({ children }: ContentProps) {
  const { close } = use(Context);
  useShortcut("escape", () => close?.());

  return (
    <View
      style={{ backgroundColor: "white", padding: 12, alignItems: "center" }}
    >
      {children}
    </View>
  );
}
