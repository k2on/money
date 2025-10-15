import { definePermissions } from "@rocicorp/zero";
import { schema } from "./zero-schema.gen";

export const permissions = definePermissions(schema, () => ({}));
