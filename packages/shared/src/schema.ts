import { definePermissions } from "@rocicorp/zero";
import { schema as schemaGen } from "./zero-schema.gen";

export const schema = schemaGen;

export const permissions = definePermissions(schema, () => ({}));
