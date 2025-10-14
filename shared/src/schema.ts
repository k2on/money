import { type Schema as ZeroSchema, createSchema, table, string, number, createBuilder, definePermissions } from "@rocicorp/zero";

const transaction = table('transaction')
  .columns({
    id: string(),
    user_id: string(),
    name: string(),
    amount: number(),
  })
  .primaryKey('id').schema;

export const schema = {
  tables: { transaction },
  relationships: {},
  enableLegacyMutators: false,
  enableLegacyQueries: false,
} satisfies ZeroSchema;

// export const schema = createSchema({
//   tables: [transaction],
//   enableLegacyMutators: false,
//   enableLegacyQueries: false,
// });

export const builder = createBuilder(schema);

export const permissions = definePermissions(schema, () => ({}));

export type Schema = typeof schema;


