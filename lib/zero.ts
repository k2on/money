import {Zero} from '@rocicorp/zero';
import { schema } from "@money/shared";

export const zero = new Zero({
  userID: 'anon',
  server: 'http://localhost:4848',
  schema,
});
