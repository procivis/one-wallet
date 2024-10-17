[![pipeline status](https://gitlab.procivis.ch/procivis/one/one-wallet/badges/main/pipeline.svg)](https://gitlab.procivis.ch/procivis/one/one-wallet/-/pipelines)
[![Quality Gate Status](https://sonarqube.dev.procivis-one.com/api/project_badges/measure?project=procivis_one_one-wallet_AYvSDHFdRCeOFTM-0S1y&metric=alert_status&token=sqb_c804296305ad5b64ba9148f4bd3d8404ed2ed60a)](https://sonarqube.dev.procivis-one.com/dashboard?id=procivis_one_one-wallet_AYvSDHFdRCeOFTM-0S1y)

| Configuration |                                                                                              Build Status                                                                                               |
| ------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Demo          | [![Build Status](https://app.bitrise.io/app/6ee8c26f-6d7b-4bcb-8ddc-be1ba3cd2687/status.svg?token=asgEvbNJgYbMPW707rocOA&branch=main)](https://app.bitrise.io/app/6ee8c26f-6d7b-4bcb-8ddc-be1ba3cd2687) |

![Procivis One Wallet](docs/assets/logo_dark_One_Wallet.png#gh-light-mode-only)
![Procivis One Wallet](docs/assets/logo_light_One_Wallet.png#gh-dark-mode-only)

## Table of Contents

- [Key features](#key-features)
- [How to use the Procivis One Wallet](#how-to-use-the-procivis-one-wallet)
- [Getting started](#getting-started)
- [Background](#background)
- [eIDAS 2.0](#eidas-20)
- [Interoperability and conformance](#interoperability-and-conformance)
- [Supported standards](#supported-standards)
- [Support](#support)
- [License](#license)

The **Procivis One Wallet** is a digital wallet solution for decentralized digital
identities and credentials. The Wallet enables the secure storage, management, and
sharing of identity data, credentials, and attributes as needed via a multitude of
technologies and protocols.

The Procivis One Wallet uses the [Procivis One Core][core] for all SSI functionality
via the [One Core React Native SDK][rncore].

The Procivis One Core is a complete solution capable of powering every element
of the digital identity credential lifecycle. See the complete solution [architecture][archi].

## Key features

- **Interoperable**
  - Uses standardized protocols for credential lifecycles for maximum compatability with
    software from other vendors. See the results of [interoperability](#interoperability-and-conformance)
    testing.
- **Compliant**
  - Supports all standards within the [**eIDAS 2.0 regulation**](#eidas-20), the
    **Swiss eID infrastructure**, and more. See the [supported standards](#supported-standards).
- **Flexible**
  - Supports online and offline exchanges over multiple transport channels. See
    [exchange and transport](#exchange-and-transport).
- **Secure**
  - Supports Hardware Security Module (HSM) for secure key storage on enabled devices.
- **Private**
  - Supports selective disclosure, privacy-preserving revocation, and many more privacy-focused
    features.

## How to use the Procivis One Wallet

- Use the Wallet for a free-standing solution that can be white-labeled
- Use the [One Core React Native SDK][rncore] to embed wallet capabilities into an existing app
- Use the [components][comp] library for UI elements for your digital wallet app

## Getting started

### Trial

The fastest way to get started with the Procivis One Wallet is to download the app
from the iOS or Android app stores and [join our Trial Environment][trial].
In the trial environment, you are given control of an organization on our server
solution, the Procivis One Desk, and can quickly begin issuing and verifying credentials.

### Documentation

See our documentation:

- [Core SDK Reference][sdkref]
- [Docs home][docs]

### Installation

### App Flavors

### Building

Each flavor has a separate configuration script defined in `package.json` file, named `rnuc:{flavor}`.

To build the app using one of flavors, configuration script needs to be called before starting the bundler and compiling the app. For example, to build Dev Wallet flavor for iOS, run:

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

### Linking packages

1. Install yalc: `yarn global add yalc`
2. Go to dep package and increase package version in package.json
3. Run in dep package: `yalc publish --push`
4. Go to one-wallet and run: `yalc add my-package-name`

### Configurations, UI themes, and assets

There are .env files in the `app/config` folder of the project for each of the app flavors. For each flavor there is a separate config file in `app/config/flavors/{CONFIG_NAME}` defining the backend urls, and Aries connections. In the same folder, there is an assets configuration containing flavor-specific assets for some UI components like a splash screen, or credential cards. In addition, each flavor has a UI theme defined in `app/theme/flavors/{CONFIG_NAME}` i.e. a color scheme, and palette.

### Icons and splashscreens

For each flavor, there is a separate set of icons and splashscreens in Android and iOS projects.

#### Android

Splashscreen under `android/app/src/main/res/values/styles.xml`
Square icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}.png`
Round icon under `android/src/main/res/minimap-{screen-size}/ic_launcher_{CONFIG_NAME}_round.png`

#### iOS

Splashscreen image is added in assets folder under `Splashscreen.{CONFIG_NAME}` image set, and in addition there is a separate Storyboard named `LaunchScreen.{CONFIG_NAME}.storyboard` for each flavor.
Icons are in asstes folder under `AppIcon.{CONFIG_NAME}` image set.

---

### Detox E2E

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

### Useful command

- Restart adb server

```shell
adb kill-server
adb start-server
```

### SBOM

Source:

- [https://github.com/CycloneDX/cdxgen](https://github.com/CycloneDX/cdxgen)

Installation:

- Install `cdxgen`
```shell
npm install -g @cyclonedx/cdxgen
```

- Install `blint` (python) for generate `android` SBOM (optional)
```shell
pip install blint
```

- Prepare env

```shell
export FETCH_LICENSE=true
```

- ReactNative SBOM

```shell
cdxgen --required-only -p -t js -o react-native-sbom.json
```

- Android (Java) SBOM

```shell
cdxgen --required-only -p -t java -o android-sbom.json
```

## Background

Decentralized digital identities and credentials is an approach to identity that relocates
digital credentials from the possession and control of centralized authorities to the
digital wallet of the credentials holder. This architecture eliminates the need for the
user to "phone home" to use their credentials as well as the verifier to communicate to
the issuer via back-channels, keeping the wallet holder's interactions private between only
those parties directly involved in each interaction. This model of digital identity is
often referred to as Self-Sovereign Identity, or SSI.

## eIDAS 2.0

If you want to provide an **EUDI Wallet**, Procivis One provides production grade open
source components to get certified and connect your organization to the eIDAS 2.0 ecosystem.

![Procivis One in the eIDAS ARF](docs/assets/eIDAS_Architecture.png)

For an EUDI Wallet, use the [react-native-one-core][rncore] SDK for embedding into
an existing app, or use the [Procivis One Wallet][pow] with adaptations to fit your
needs.

If you want to issue into an EUDI Wallet or offer services to an EUDI Wallet holder,
use the [Procivis One Core][core].

## Interoperability and conformance

Procivis One is built using [open standards](#supported-standards) and tested to ensure
interoperability with different software vendors and across different international
regulatory ecosystems.

- W3C standards
  - The W3C offers several test suites for standards conformance. See
    the latest test results for Procivis One at [canivc.com][canivc].
- ISO/IEC 18013-5 mDL
  - Procivis One's implementation of the ISO mDL standard is compatible with the
    OpenWallet Foundation's verifier: Procivis One can successfully issue mDL
    credentials to a Procivis One Wallet, and these credentials can successfully
    be verified by the OpenWallet Foundation's verifier. See the [OpenWallet Foundation libraries][owf].
- eIDAS 2.0; EUDI Wallet
  - The EU Digital Wallet is developing [issuer][eudiwi] and [verifier][eudiwv] testing for
    interoperability in mdoc and SD-JWT formats using OID4VC protocols. We follow the ongoing
    development of the testing platform and regularly test against it.

We continue to look for more opportunities for interoperability testing as the standards
and regulations mature and harden.

## Supported standards

### Credential data models

- [Verifiable Credentials][vcdm] (VCs)
  - JSON-LD
  - SD-JWT
  - JWT
- [ISO/IEC 18013-5:2021][iso]
  - mdoc

### Exchange and transport

- OpenID for Verifiable Credentials
  - [OID4VCI][vci]; ID-1
  - [OID4VP][vp]; ID-2
    - [OID4VP over BLE][ble]; optimized version of Draft 00
    - [OID4VP over MQTT][mqtt]; proprietary adaptation of OID4VP over BLE via MQTT channel
- [ISO/IEC 18013-5][iso]
  - QR code engagement and offline device retrieval over BLE

### Key storage

- Secure Enclave (iOS) and Android Keystore (TEE or Strongbox)
- Internal encrypted database

### Revocation methods

- [Bitstring Status List v1.0][sl]
- [Linked Validity Verifiable Credentials (LVVC)][lvvc]

## Support

Need support or have feedback? [Contact us](https://www.procivis.ch/en/contact).

## License

Some rights reserved. This library is published under the [Apache License
Version 2.0](./LICENSE).

![Procivis AG](docs/assets/logo_light_mode_Procivis.svg#gh-light-mode-only)
![Procivis AG](docs/assets/logo_dark_mode_Procivis.svg#gh-dark-mode-only)

© Procivis AG, [https://www.procivis.ch](https://www.procivis.ch).

[archi]: https://github.com/procivis#architecture
[ble]: https://openid.net/specs/openid-4-verifiable-presentations-over-ble-1_0.html
[canivc]: https://canivc.com/implementations/procivis-one-core/
[comp]: https://github.com/procivis/one-react-native-components
[core]: https://github.com/procivis/one-core
[docs]: https://docs.procivis.ch/
[eudiwi]: https://issuer.eudiw.dev/
[eudiwv]: https://verifier.eudiw.dev/home
[iso]: https://www.iso.org/standard/69084.html
[lvvc]: https://eprint.iacr.org/2022/1658.pdf
[mqtt]: https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html
[owf]: https://github.com/openwallet-foundation-labs/identity-credential
[pow]: https://github.com/procivis/one-wallet
[rncore]: https://github.com/procivis/react-native-one-core
[sdkref]: https://docs.procivis.ch/sdk/overview
[sl]: https://www.w3.org/TR/vc-bitstring-status-list/
[trial]: https://docs.procivis.ch/trial/intro
[vcdm]: https://www.w3.org/TR/vc-data-model-2.0/
[vci]: https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-12.html
[vp]: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
