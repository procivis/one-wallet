[![pipeline status](https://gitlab.procivis.ch/procivis/one/one-wallet/badges/main/pipeline.svg)](https://gitlab.procivis.ch/procivis/one/one-wallet/-/pipelines)
[![Quality Gate Status](https://sonarqube.dev.procivis-one.com/api/project_badges/measure?project=procivis_one_one-wallet_AYvSDHFdRCeOFTM-0S1y&metric=alert_status&token=sqb_c804296305ad5b64ba9148f4bd3d8404ed2ed60a)](https://sonarqube.dev.procivis-one.com/dashboard?id=procivis_one_one-wallet_AYvSDHFdRCeOFTM-0S1y)

| Configuration |                                                                                              Build Status                                                                                               |
| ------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Demo          | [![Build Status](https://app.bitrise.io/app/6ee8c26f-6d7b-4bcb-8ddc-be1ba3cd2687/status.svg?token=asgEvbNJgYbMPW707rocOA&branch=main)](https://app.bitrise.io/app/6ee8c26f-6d7b-4bcb-8ddc-be1ba3cd2687) |


# Installation

### Prerequisites

For using private Procivis registry you need to create [Personal Access token](https://gitlab.procivis.ch/-/profile/personal_access_tokens)
with `read_api` permissions

* Edit (or create) file `~/.yarnrc.yml` (home directory) with:
```yaml
npmScopes:
  procivis:
    npmRegistryServer: "https://gitlab.procivis.ch/api/v4/packages/npm/"
    npmAuthToken: <YOUR_PERSONAL_TOKEN>
```



# App Flavors

## Building

Each flavor has a separate configuration script defined in `package.json` file, named `rnuc:{flavor}`.

To build the app using one of flavors, configuration script needs to be called before strting bundler and compiling the app. For example, to build Dev Wallet flavor for iOS, run:

```shell
yarn rnuc:dev
yarn build-ios
```

or to debug same flavor:

```shell
yarn rnuc:dev
yarn start
yarn ios
```

## Configurations, UI themes, and assets

There are .env files in the `app/config` folder of the project for each of the app flavors. For each flavor there is a separate config file in `app/config/flavors/{CONFIG_NAME}` defining the backend urls, and Aries connections. In the same folder, there is an assets configuration containing flavor-specific assets for some UI components like a splash screen, or credential cards. In addition, each flavor has a UI theme defined in `app/theme/flavors/{CONFIG_NAME}` i.e. a color scheme, and palette.

## Icons and splashscreens

For each flavor, there is a separate set of icons and splashscreens in Android and iOS projects.

### Android

Splashscreen under `android/app/src/main/res/values/styles.xml`
Square icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}.png`
Round icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}_round.png`

### iOS

Splashscreen image is added in assets folder under `Splashscreen.{CONFIG_NAME}` image set, and in addition there is a separate Storyboard named `LaunchScreen.{CONFIG_NAME}.storyboard` for each flavor.
Icons are in asstes folder under `AppIcon.{CONFIG_NAME}` image set.

## Detox E2E

In order to run the E2E tests, one needs to build a proper detox app build first:

See the `.detoxrc.js` for all possible configurations.

#### Android

- build (once)

```shell
npx detox build --configuration android.emu.release
```

- run tests

```shell
npx detox test --configuration android.emu.release
```

#### iOS

```shell
npx detox build --configuration ios.sim.release
```

```shell
npx detox test --configuration ios.sim.release
```

### Useful command:

- Restart adb server

```shell
adb kill-server
adb start-server
```

## SBOM

Source:

- [https://github.com/CycloneDX/cdxgen](https://github.com/CycloneDX/cdxgen)

Installation:

```shell
npm install -g @cyclonedx/cdxgen
```

- Prepare env

```shell
export FETCH_LICENSE=true
```

- ReactNative SBOM

```shell
export DEPENDENCY_TRACK_PROJECT_NAME="ONE-Wallet"
cdxgen --required-only -p -t js -o bom-rn.xml
```

- Android SBOM

```shell
export DEPENDENCY_TRACK_PROJECT_NAME="ONE-Wallet-Android"
cdxgen --required-only -p -t java -o bom-android.xml android/
```
