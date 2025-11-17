import { authClient } from "@/lib/auth-client";
import { use, useEffect, useState } from "react";
import { AuthContext } from "./auth/context";
import * as Code from "./auth/code";

const CLIENT_ID = "koon-family";

export function Auth() {
  const { setAuth } = use(AuthContext);

  const [code, setCode] = useState<string>();
  const [error, setError] = useState<string>();

  const pollForToken = async (code: string, interval = 5) => {
    const { data, error } = await authClient.device.token({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: code,
      client_id: CLIENT_ID,
      fetchOptions: { headers: { "user-agent": "My CLI" } },
    });

    if (data?.access_token) {
      const { data: sessionData, error } = await authClient.getSession({
        fetchOptions: {
          auth: {
            type: "Bearer",
            token: data.access_token
          }
        }
      });
      if (error) return setError(error.message);
      if (!sessionData) return setError("No data");

      setAuth({
        token: data.access_token,
        auth: sessionData,
      });
    }

    if (error) {
      if (error.error === "authorization_pending") {
        setTimeout(() => pollForToken(code, interval), interval * 1000);
      } else if (error.error === "slow_down") {
        setTimeout(() => pollForToken(code, interval + 5), (interval + 5) * 1000);
      } else {
        setError(`${error}`);
      }
    }
  }

  async function getCode() {
    try {
      const { data, error } = await authClient.device.code({
        client_id: CLIENT_ID,
        scope: "openid profile email",
      });
      if (error) return setError(error.error_description);
      if (!data) return setError("No data returned");

      setCode(data.user_code);

      pollForToken(data?.device_code);

    } catch (e) {
      setError(`${e}`);
    }
  }


  useEffect(() => {
    getCode();
  }, []);

  if (error) return <Code.Error msg={error} />

  return !code ? <Code.Loading /> : <Code.Display code={code} />;
}


