[![pipeline status](https://gitlab.procivis.ch/procivis/one/one-wallet/badges/master/pipeline.svg)](https://gitlab.procivis.ch/procivis/one/one-wallet/-/pipelines)

| Configuration |                                                                           Build Status                                                                            |
| ------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| SSI+          | [![Build Status](https://app.bitrise.io/app/079ca4bd895e3f5b/status.svg?token=y7WWrQz9-9hOi6grH18Pog&branch=master)](https://app.bitrise.io/app/079ca4bd895e3f5b) |

# App Flavors

## Building

Each flavor has a separate configuration script defined in `package.json` file, named `rnuc:{flavor}`.

To build the app using one of flavors, configuration script needs to be called before strting bundler and compiling the app. For example, to build Dev Wallet flavor for iOS, run:

```
yarn rnuc:dev
yarn build-ios
```

or to debug same flavor:

```
yarn rnuc:dev
yarn start
yarn ios
```

## Configurations, UI themes, and assets

There are .env files in the `app/config` folder of the project for each of the app flavors. For each flavor there is a separate config file in `app/config/flavors/{CONFIG_NAME}` defining the backend urls, and Aries connections. In the same folder, there is an assets configuration containing flavor-specific assets for some UI components like a splash screen, or credential cards. In addition, each flavor has a UI theme defined in `app/theme/flavors/{CONFIG_NAME}` i.e. a color scheme, and palette.

## Icons and splashscreens

For each flavor, there is a separate set of icons and splashscreens in Android and iOS projects.

### Android

Splashscreen under `android/src/main/res/drawable/splashscreen_{CONFIG_NAME}.png`
Square icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}.png`
Round icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}_round.png`

### iOS

Splashscreen image is added in assets folder under `Splashscreen.{CONFIG_NAME}` image set, and in addition there is a separate Storyboard named `LaunchScreen.{CONFIG_NAME}.storyboard` for each flavor.
Icons are in asstes folder under `AppIcon.{CONFIG_NAME}` image set.
