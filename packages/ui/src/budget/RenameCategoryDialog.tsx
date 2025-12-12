import { useRef, useState } from "react";
import * as Dialog from "../../components/Dialog";
import { View, Text, TextInput } from "react-native";
import { type Category, type Mutators, type Schema } from "@money/shared";
import { useZero } from "@rocicorp/zero/react";

interface RenameCategoryDialogProps {
  renaming: Category | undefined;
  setRenaming: (v: Category | undefined) => void;
}
export function RenameCategoryDialog({
  renaming,
  setRenaming,
}: RenameCategoryDialogProps) {
  const refText = useRef("");
  const [renamingText, setRenamingText] = useState("");

  const z = useZero<Schema, Mutators>();

  return (
    <Dialog.Provider
      visible={renaming != undefined}
      close={() => setRenaming(undefined)}
    >
      <Dialog.Content>
        <View style={{ width: 400 }}>
          <View
            style={{
              borderBottomWidth: 1,
              paddingTop: 12,
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <TextInput
              style={{
                fontFamily: "mono",
                // @ts-ignore
                outline: "none",
              }}
              autoFocus
              selectTextOnFocus
              defaultValue={renaming?.label}
              onChangeText={(t) => {
                refText.current = t;
                setRenamingText(t);
              }}
              onKeyPress={(e) => {
                if (!renaming) return;
                if (e.nativeEvent.key == "Enter") {
                  if (refText.current.trim() == "")
                    return setRenaming(undefined);
                  z.mutate.budget.updateCategory({
                    id: renaming.id,
                    label: refText.current,
                  });
                  setRenaming(undefined);
                } else if (e.nativeEvent.key == "Escape") {
                  setRenaming(undefined);
                }
              }}
            />
          </View>

          <View
            style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}
          >
            <Text style={{ fontFamily: "mono" }}>
              → Rename category to: {renamingText || renaming?.label}
            </Text>
            <Text style={{ fontFamily: "mono" }}>→ Cancel</Text>
          </View>
        </View>
      </Dialog.Content>
    </Dialog.Provider>
  );
}
