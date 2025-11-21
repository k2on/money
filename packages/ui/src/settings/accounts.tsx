import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import * as Table from "../table";
import { use, useEffect, useState } from "react";
import { RouterContext } from "..";
import { View, Text, Modal, Linking } from "react-native";
import { Button } from "../../components/Button";
import { useKeyboard } from "../useKeyboard";
import * as Dialog from "../dialog";

const COLUMNS: Table.Column[] = [
  { name: 'name', label: 'Name' },
  { name: 'createdAt', label: 'Added At', render: (n) => new Date(n).toLocaleString() },
];

export function Accounts() {
  const { auth } = use(RouterContext);
  const [items] = useQuery(queries.getItems(auth));
  const [deleting, setDeleting] = useState<typeof items>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [link] = useQuery(queries.getPlaidLink(auth));
  const [loadingLink, setLoadingLink] = useState(false);

  const z = useZero<Schema, Mutators>();

  
  useKeyboard((key) => {
    if (key.name == 'n') {
      setDeleting([]);
    } else if (key.name == 'y') {
      onDelete();
    }
  }, [deleting]);

  useKeyboard((key) => {
    if (key.name == 'a') {
      addAccount();
    }
  }, [link])

  const onDelete = () => {
    if (!deleting) return
    const accountIds = deleting.map(account => account.id);
    z.mutate.link.deleteAccounts({ accountIds });
    setDeleting([]);
  }

  const addAccount = () => {
    if (link) {
      Linking.openURL(link.link);
    } else {
      setLoadingLink(true);
      z.mutate.link.create();
    }

    // else {
    //   setLoadingLink(true);
    //   z.mutate.link.create().server.then(async () => {
    //     const link = await queries.getPlaidLink(auth).run();
    //     setLoadingLink(false);
    //     if (link) {
    //       Linking.openURL(link.link);
    //     }
    //   });
    // }
  }

  useEffect(() => {
    if (loadingLink && link) {
      Linking.openURL(link.link);
      setLoadingLink(false);
    }
  }, [link, loadingLink]);

  return (
    <>

      <Dialog.Provider visible={!deleting} close={() => setDeleting([])}>
        <Dialog.Content>
          <Text style={{ fontFamily: 'mono' }}>Delete Account</Text>
          <Text style={{ fontFamily: 'mono' }}> </Text>
          <Text style={{ fontFamily: 'mono' }}>You are about to delete the following accounts:</Text>

          <View>
            {deleting.map(account => <Text style={{ fontFamily: 'mono' }}>- {account.name}</Text>)}
          </View>

          <Text style={{ fontFamily: 'mono' }}> </Text>

          <View style={{ flexDirection: 'row' }}>
            <Button variant="secondary" onPress={() => { setDeleting([]); }}>Cancel (n)</Button>

            <Text style={{ fontFamily: 'mono' }}> </Text>

            <Button variant="destructive" onPress={() => {
                onDelete();
              }}>Delete (y)</Button>
          </View>
        </Dialog.Content>
      </Dialog.Provider>



      {/* <Dialog.Provider visible={isAddOpen} close={() => setIsAddOpen(false)}> */}
      {/*   <Dialog.Content> */}
      {/*     <Text style={{ fontFamily: 'mono' }}>Add Account</Text> */}
      {/**/}
      {/*     <AddAccount /> */}
      {/*   </Dialog.Content> */}
      {/* </Dialog.Provider> */}

      <View style={{ padding: 10 }}>

        <Button onPress={addAccount}>{loadingLink ? "Loading..." : "Add Account (a)"}</Button>

        <Text style={{ fontFamily: 'mono' }}> </Text>

        <Table.Provider columns={COLUMNS} data={items} onKey={(key, selected) => {
          if (key.name == 'd') {
            setDeleting(selected);
          }
        }}>
          <Table.Body />
        </Table.Provider>
      </View>
    </>
  );
}


function AddAccount() {
  const { auth } = use(RouterContext);
  const [link] = useQuery(queries.getPlaidLink(auth));

  return (
    <Text style={{ fontFamily: 'mono' }}>{link?.link}</Text>
  );
}
