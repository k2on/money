# Money

Personal finance application by [Max Koon](https://max.koon.us). Writen with Typescript, Expo/React Native, Zero Sync Engine, Better Auth, and Drizzle.

## Development

```sh
git clone https://git.koon.us/max/money.git
direnv allow
cp .env.example .env.dev
ln -s .env.dev .env
vim .env.dev # Update with Plaid credentials
pnpm install
pnpm dev
```

## Deployment

An example deployment of this application can be found [here](https://git.koon.us/max/os/src/branch/main/host/ark/service/money.nix).

