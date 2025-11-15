import { useState } from "react";
import { Transactions } from "./transactions";
import { Text } from "react-native";
import { Settings } from "./settings";
import { useKeyboard } from "./useKeyboard";

type Page = "transactions" | "settings";
type AppProps = {
  page?: Page;
  onPageChange?: (page: Page) => void;
}

export function App({ page, onPageChange }: AppProps) {
  const [curr, setPage] = useState<Page>(page || "transactions");

  useKeyboard((key) => {
    if (key.name == "1") {
      setPage("transactions");
      if (onPageChange)
      onPageChange("transactions");
    } else if (key.name == "2") {
      setPage("settings");
      if (onPageChange)
      onPageChange("settings");
    }
  });

  return curr == "transactions" ? <Transactions /> : <Settings />;
}


