import { useRef, useState } from "react";
import * as Dialog from "../../components/Dialog";
import { View, Text, TextInput } from "react-native";
import { type Category, type Mutators, type Schema } from "@money/shared";
import { useZero } from "@rocicorp/zero/react";

export type Updating = {
  category: CategoryWithComputed;
  every: Category["every"];
};

export type CategoryWithComputed = Category & {
  month: number;
  year: number;
};

interface UpdateCategoryAmountDialogProps {
  updating: Updating | undefined;
  setUpdating: (v: Updating | undefined) => void;
}
export function UpdateCategoryAmountDialog({
  updating,
  setUpdating,
}: UpdateCategoryAmountDialogProps) {
  const category = updating?.category;
  const every = updating?.every;

  const refText = useRef("");
  const [amountText, setAmountText] = useState("");

  const z = useZero<Schema, Mutators>();

  return (
    <Dialog.Provider
      visible={category != undefined}
      close={() => setUpdating(undefined)}
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
              defaultValue={category?.month.toString()}
              onChangeText={(t) => {
                refText.current = t;
                setAmountText(t);
              }}
              onKeyPress={(e) => {
                if (!category) return;
                if (e.nativeEvent.key == "Enter") {
                  if (refText.current.trim() == "")
                    return setUpdating(undefined);

                  try {
                    const parsed = parseFloat(refText.current);

                    const amount = (function () {
                      switch (every) {
                        case "year":
                          return parsed / 12;
                        case "month":
                          return parsed;
                        case "week":
                          return parsed * 4;
                      }
                    })();

                    z.mutate.budget.updateCategory({
                      id: category.id,
                      amount,
                      every,
                    });
                    setUpdating(undefined);
                  } catch (e) {}
                } else if (e.nativeEvent.key == "Escape") {
                  setUpdating(undefined);
                }
              }}
            />
          </View>

          <View
            style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}
          >
            <Text style={{ fontFamily: "mono" }}>
              → Update monthly amount to: {amountText || category?.month}
            </Text>
            <Text style={{ fontFamily: "mono" }}>→ Cancel</Text>
          </View>
        </View>
      </Dialog.Content>
    </Dialog.Provider>
  );
}
