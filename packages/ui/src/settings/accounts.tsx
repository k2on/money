import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from "@money/shared";
import { use, useEffect, useState } from "react";
import { RouterContext } from "..";
import { View, Text, Linking } from "react-native";
import { Button } from "../../components/Button";
import * as Table from "../../components/Table";
import * as Dialog from "../../components/Dialog";

const COLUMNS: Table.Column[] = [
  { name: "name", label: "Name" },
  {
    name: "createdAt",
    label: "Added At",
    render: (n) => new Date(n).toLocaleString(),
  },
];

export function Accounts() {
  const { auth } = use(RouterContext);
  const [items] = useQuery(queries.getItems(auth));
  const [deleting, setDeleting] = useState<typeof items>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const z = useZero<Schema, Mutators>();

  const onDelete = () => {
    if (!deleting) return;
    const accountIds = deleting.map((account) => account.id);
    z.mutate.link.deleteAccounts({ accountIds });
    setDeleting([]);
  };

  const addAccount = () => {
    setIsAddOpen(true);
  };

  return (
    <>
      <Dialog.Provider
        visible={deleting.length > 0}
        close={() => setDeleting([])}
      >
        <Dialog.Content>
          <Text style={{ fontFamily: "mono" }}>Delete Account</Text>
          <Text style={{ fontFamily: "mono" }}> </Text>
          <Text style={{ fontFamily: "mono" }}>
            You are about to delete the following accounts:
          </Text>

          <View>
            {deleting.map((account) => (
              <Text style={{ fontFamily: "mono" }}>- {account.name}</Text>
            ))}
          </View>

          <Text style={{ fontFamily: "mono" }}> </Text>

          <View style={{ flexDirection: "row" }}>
            <Button
              variant="secondary"
              onPress={() => {
                setDeleting([]);
              }}
              shortcut="n"
            >
              Cancel
            </Button>

            <Text style={{ fontFamily: "mono" }}> </Text>

            <Button
              variant="destructive"
              onPress={() => {
                onDelete();
              }}
              shortcut="y"
            >
              Delete
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Provider>

      <Dialog.Provider visible={isAddOpen} close={() => setIsAddOpen(false)}>
        <Dialog.Content>
          <Text style={{ fontFamily: "mono" }}>Add Account</Text>
          <AddAccount />
        </Dialog.Content>
      </Dialog.Provider>

      <View style={{ padding: 10 }}>
        <View style={{ alignSelf: "flex-start" }}>
          <Button shortcut="a" onPress={addAccount}>
            Add Account
          </Button>
        </View>

        <Text style={{ fontFamily: "mono" }}> </Text>

        <Table.Provider
          columns={COLUMNS}
          data={items}
          onKey={(key, selected) => {
            if (key.name == "d") {
              setDeleting(selected);
            }
          }}
        >
          <Table.Body />
        </Table.Provider>
      </View>
    </>
  );
}

function AddAccount() {
  const { auth } = use(RouterContext);
  const [link, details] = useQuery(queries.getPlaidLink(auth));
  const { close } = use(Dialog.Context);

  const openLink = () => {
    if (!link) return;
    Linking.openURL(link.link);
  };

  const z = useZero<Schema, Mutators>();

  useEffect(() => {
    console.log(link, details);
    if (details.type != "complete") return;
    if (link != undefined) {
      if (!link.completeAt) {
        const timer = setInterval(() => {
          console.log("Checking for link");
          z.mutate.link.get({ link_token: link.token });
        }, 1000 * 5);
        return () => clearInterval(timer);
      } else {
        if (close) close();
        return;
      }
    }
    console.log("Creating new link");
    z.mutate.link.create();
  }, [link, details]);

  return (
    <>
      <Button onPress={() => close && close()}>close</Button>
      {link ? (
        <>
          <Text style={{ fontFamily: "mono" }}>
            Please click the button to complete setup.
          </Text>

          <Button shortcut="return" onPress={openLink}>
            Open Plaid
          </Button>
        </>
      ) : (
        <Text style={{ fontFamily: "mono" }}>Loading Plaid Link</Text>
      )}
    </>
  );
}
