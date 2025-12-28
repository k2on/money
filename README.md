# Koon Money

<img width="810" height="438" alt="image" src="https://github.com/user-attachments/assets/45cb0e5f-d555-43f0-8524-ae038a18d3e6" />

The fastest personal finance application that runs on iOS, Android, Web, and the terminal.

Made with Typescript, Expo/React Native, OpenTUI, Zero Sync Engine, Better Auth, and Drizzle.

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

