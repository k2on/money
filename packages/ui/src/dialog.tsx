import { type ReactNode } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { useKeyboard } from "./useKeyboard";

interface ProviderProps {
  children: ReactNode;
  visible?: boolean;
  close?: () => void;
}
export function Provider({ children, visible, close }: ProviderProps) {
  useKeyboard((key) => {
    if (key.name == 'escape') {
      if (close) close();
    }
  }, []);

  return (
    <Modal transparent visible={visible} >
      {/* <Pressable onPress={() => close && close()} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',  }}> */}
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',  }}>
        {children}
      </View>
    </Modal>
  );
}

interface ContentProps {
  children: ReactNode;
}
export function Content({ children }: ContentProps) {
  return (
    <View style={{ backgroundColor: 'white', padding: 12, alignItems: 'center'  }}>
      {children}
    </View>
  );
}
