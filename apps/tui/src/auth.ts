import {
  Context,
  Data,
  Effect,
  Layer,
  Schema,
  Console,
  Schedule,
  Ref,
  Duration,
} from "effect";
import { FileSystem } from "@effect/platform";
import { config } from "./config";
import { AuthState } from "./schema";
import { authClient } from "@/lib/auth-client";
import type { BetterFetchResponse } from "@better-fetch/fetch";

class AuthClientUnknownError extends Data.TaggedError(
  "AuthClientUnknownError",
) {}
class AuthClientExpiredToken extends Data.TaggedError(
  "AuthClientExpiredToken",
) {}
class AuthClientNoData extends Data.TaggedError("AuthClientNoData") {}
class AuthClientFetchError extends Data.TaggedError("AuthClientFetchError")<{
  message: string;
}> {}
class AuthClientError<T> extends Data.TaggedError("AuthClientError")<{
  error: T;
}> {}

type ErrorType<E> = {
  [key in keyof ((E extends Record<string, any>
    ? E
    : {
        message?: string;
      }) & {
    status: number;
    statusText: string;
  })]: ((E extends Record<string, any>
    ? E
    : {
        message?: string;
      }) & {
    status: number;
    statusText: string;
  })[key];
};

export class AuthClient extends Context.Tag("AuthClient")<
  AuthClient,
  AuthClientImpl
>() {}

export interface AuthClientImpl {
  use: <T, E>(
    fn: (client: typeof authClient) => Promise<BetterFetchResponse<T, E>>,
  ) => Effect.Effect<
    T,
    | AuthClientError<ErrorType<E>>
    | AuthClientFetchError
    | AuthClientUnknownError
    | AuthClientNoData,
    never
  >;
}

export const make = () =>
  Effect.gen(function* () {
    return AuthClient.of({
      use: (fn) =>
        Effect.gen(function* () {
          const { data, error } = yield* Effect.tryPromise({
            try: () => fn(authClient),
            catch: (error) =>
              error instanceof Error
                ? new AuthClientFetchError({ message: error.message })
                : new AuthClientUnknownError(),
          });
          if (error != null)
            return yield* Effect.fail(new AuthClientError({ error }));
          if (data == null) return yield* Effect.fail(new AuthClientNoData());
          return data;
        }),
    });
  });

export const AuthClientLayer = Layer.scoped(AuthClient, make());

const pollToken = ({ device_code }: { device_code: string }) =>
  Effect.gen(function* () {
    const auth = yield* AuthClient;
    const intervalRef = yield* Ref.make(5);

    const tokenEffect = auth.use((client) => {
      Console.debug("Fetching");

      return client.device.token({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code,
        client_id: config.authClientId,
        fetchOptions: { headers: { "user-agent": config.authClientUserAgent } },
      });
    });

    return yield* tokenEffect.pipe(
      Effect.tapError((error) =>
        error._tag == "AuthClientError" && error.error.error == "slow_down"
          ? Ref.update(intervalRef, (current) => {
              Console.debug("updating delay to ", current + 5);
              return current + 5;
            })
          : Effect.void,
      ),
      Effect.retry({
        schedule: Schedule.addDelayEffect(
          Schedule.recurWhile<Effect.Effect.Error<typeof tokenEffect>>(
            (error) =>
              error._tag == "AuthClientError" &&
              (error.error.error == "authorization_pending" ||
                error.error.error == "slow_down"),
          ),
          () => Ref.get(intervalRef).pipe(Effect.map(Duration.seconds)),
        ),
      }),
    );
  });

const getFromFromDisk = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(config.authPath);
  const auth = yield* Schema.decode(Schema.parseJson(AuthState))(content);
  if (auth.session.expiresAt < new Date())
    yield* Effect.fail(new AuthClientExpiredToken());
  return auth;
});

const requestAuth = Effect.gen(function* () {
  const auth = yield* AuthClient;
  const { device_code, user_code } = yield* auth.use((client) =>
    client.device.code({
      client_id: config.authClientId,
      scope: "openid profile email",
    }),
  );

  console.log(`Please use the code: ${user_code}`);

  const { access_token } = yield* pollToken({ device_code });

  const sessionData = yield* auth.use((client) =>
    client.getSession({
      fetchOptions: {
        auth: {
          type: "Bearer",
          token: access_token,
        },
      },
    }),
  );
  if (sessionData == null) return yield* Effect.fail(new AuthClientNoData());

  const result = yield* Schema.decodeUnknown(AuthState)(sessionData);

  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString(config.authPath, JSON.stringify(result));

  return result;
});

export const getAuth = Effect.gen(function* () {
  return yield* getFromFromDisk.pipe(
    Effect.catchAll(() => requestAuth),
    Effect.catchTag("AuthClientFetchError", (err) =>
      Effect.gen(function* () {
        yield* Console.error("Authentication failed: " + err.message);
        process.exit(1);
      }),
    ),
    Effect.catchTag("AuthClientNoData", () =>
      Effect.gen(function* () {
        yield* Console.error(
          "Authentication failed: No error and no data was given by the auth server.",
        );
        process.exit(1);
      }),
    ),
    Effect.catchTag("ParseError", (err) =>
      Effect.gen(function* () {
        yield* Console.error(
          "Authentication failed: Auth data failed: " + err.toString(),
        );
        process.exit(1);
      }),
    ),
    Effect.catchTag("BadArgument", () =>
      Effect.gen(function* () {
        yield* Console.error("Authentication failed: Bad argument");
        process.exit(1);
      }),
    ),
    Effect.catchTag("SystemError", () =>
      Effect.gen(function* () {
        yield* Console.error("Authentication failed: System error");
        process.exit(1);
      }),
    ),
    Effect.catchTag("AuthClientError", ({ error }) =>
      Effect.gen(function* () {
        yield* Console.error("Authentication error: " + error.statusText);
        process.exit(1);
      }),
    ),
    Effect.catchTag("AuthClientUnknownError", () =>
      Effect.gen(function* () {
        yield* Console.error("Unknown authentication error");
        process.exit(1);
      }),
    ),
  );
});
