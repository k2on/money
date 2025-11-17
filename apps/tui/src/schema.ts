import { Schema } from "effect";

const SessionSchema = Schema.Struct({
  expiresAt: Schema.DateFromString,
  token: Schema.String,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  ipAddress: Schema.optional(Schema.NullishOr(Schema.String)),
  userAgent: Schema.optional(Schema.NullishOr(Schema.String)),
  userId: Schema.String,
  id: Schema.String,
});

const UserSchema = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  emailVerified: Schema.Boolean,
  image: Schema.optional(Schema.NullishOr(Schema.String)),
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  id: Schema.String,
});


export const AuthState = Schema.Struct({
  session: SessionSchema,
  user: UserSchema,
});

export type AuthData = typeof AuthState.Type;

