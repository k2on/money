import { Schema } from "effect";

const DateFromDateOrString = Schema.Union(Schema.DateFromString, Schema.DateFromSelf);

const SessionSchema = Schema.Struct({
  expiresAt: DateFromDateOrString,
  token: Schema.String,
  createdAt: DateFromDateOrString,
  updatedAt: DateFromDateOrString,
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
  createdAt: DateFromDateOrString,
  updatedAt: DateFromDateOrString,
  id: Schema.String,
});


export const AuthState = Schema.Struct({
  session: SessionSchema,
  user: UserSchema,
});

export type AuthData = typeof AuthState.Type;

