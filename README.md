<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://assets.procivis-one.com/static/logo/logo_light_One_Wallet.png">
  <source media="(prefers-color-scheme: light)" srcset="https://assets.procivis-one.com/static/logo/logo_dark_One_Wallet.png">
  <img alt="Shows a Procivis One Wallet black logo in light color mode and a white one in dark color mode." src="https://assets.procivis-one.com/static/logo/logo_dark_One_Wallet.png">
</picture>

## Table of Contents

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

The _Procivis One Wallet_ uses the [Procivis One Core][core] for all SSI functionality
via the [One Core React Native SDK][rncore].

The _Procivis One Core_ is a complete solution capable of powering every element
of the digital identity credential lifecycle. See the [key features][key] and
complete solution [architecture][archi].

## How to use the Procivis One Wallet

- Use the Wallet for a free-standing solution that can be white-labeled
- Use the [One Core React Native SDK][rncore] to embed wallet capabilities into an existing app
- Use the [One Core React Components][comp] library for UI elements for your digital wallet app

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
pnpm rnuc:dev
pnpm build-ios
```

or to debug same flavor:

```shell
pnpm rnuc:dev
pnpm start
pnpm ios
```

### Linking packages

1. Install yalc: `pnpm global add yalc`
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

### Requirements

Detox dependency `node-canvas` requires native dependencies installed to build and run properly. Use the link for details: https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling
After installing canvas dependencies, reinstall node dependencies by removing `node_modules` and then `pnpm install` or using `pnpm rebuild`

### Building

In order to run the E2E tests, one needs to set up `.env.detox` file (in the root of this project) with desk url, username and password:

```
API_BASE_URL='https://example.com'
KEYCLOAK_URL= 'https://example.com'
KEYCLOAK_USER_NAME=example@user.email
KEYCLOAK_PASSWORD=example.password
KEYCLOAK_CLIENT_SECRET=example.secret
```

After setting up, to run tests it's necessary to build a proper detox app build first:

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

If you want to provide an **EUDI Wallet**, _Procivis One_ provides production grade open
source components to get certified and connect your organization to the eIDAS 2.0 ecosystem.

![Procivis One in the eIDAS ARF](https://assets.procivis-one.com/static/diff/eIDAS_Architecture.png)

For an EUDI Wallet, use the [One Core React Native SDK][rncore] for embedding into
an existing app, or use the [Procivis One Wallet][pow] with adaptations to fit your
needs.

If you want to issue into an EUDI Wallet or offer services to an EUDI Wallet holder,
use the [Procivis One Core][core].

## Interoperability and conformance

_Procivis One_ is built using [open standards](#supported-standards) and tested to ensure
interoperability with different software vendors and across different international
regulatory ecosystems.

- W3C standards
  - The W3C offers several test suites for standards conformance. See
    the latest test results for _Procivis One_ at [canivc.com][canivc].
- ISO/IEC 18013-5 mDL
  - _Procivis One_'s implementation of the ISO mDL standard is compatible with the
    OpenWallet Foundation's verifier: _Procivis One_ can successfully issue mDL
    credentials to a _Procivis One Wallet_, and these credentials can successfully
    be verified by the OpenWallet Foundation's verifier. See the [OpenWallet Foundation libraries][owf].
- eIDAS 2.0; EUDI Wallet
  - The EU Digital Wallet is developing [issuer][eudiwi] and [verifier][eudiwv] testing for
    interoperability in mdoc and SD-JWT formats using OID4VC protocols. We follow the ongoing
    development of the testing platform and regularly test against it.

We continue to look for more opportunities for interoperability testing as the standards
and regulations mature and harden.

## Supported standards

### Credential models

#### W3C VC

- [W3C Verifiable Credentials Data Model 2.0][vcdm] in the following variations:

| Securing mechanism                           | Supported representations                           | Supported proof/signature types                                                                                                                                                                                                                                       |
| -------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [W3C Data Integrity Proofs][vcdi] (embedded) | [JSON-LD][jld] in Compacted Document Form           | <ul><li>[W3C Data Integrity ECDSA Cryptosuites v1.0][ecd] / [ecdsa-rdfc-2019][ecd2019]</li><li>[W3C Data Integrity EdDSA Cryptosuites v1.0][edd] / [eddsa-rdfc-2022][edd2022]</li><li>[W3C Data Integrity BBS Cryptosuites v1.0][bbs] / [bbs-2023][bbs2023]</li></ul> |
| [W3C VC-JOSE-COSE][jose] (enveloping)        | <ul><li>[SD-JWT][sdjwt]</li><li>[JWT][jw]</li></ul> | <ul><li>JOSE / ECDSA [ES256][es2]</li><li>JOSE / EdDSA [Ed25519][ed255]</li><li>JOSE / CRYSTALS-DILITHIUM 3 [CRYDI3][crydi3]\*                                                                                                                                        |

\* CRYSTALS-DILITHIUM is a post-quantum resistant signature scheme, selected by NIST for [Post-Quantum Cryptography Standardization][pqc].
Support for the recently published [FIPS-204][fips] is planned for the near future.

#### ISO mdoc

- [ISO/IEC 18013-5:2021][iso5] standard for mdoc credentials.
  - [COSE][cose] proofs
    - ECDSA [ES256][es2]
    - EdDSA [Ed25519][ed255]

#### IETF SD-JWT VC

- [IETF SD-JWT-based Verifiable Credentials][sdjwtvc]:

| Standard       | Supported representations | Supported proof/signature types                                                                                                          |
| -------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| IETF SD-JWT VC | SD-JWT                    | <ul><li>JOSE / ECDSA [ES256][es2]</li><li>JOSE / EdDSA [Ed25519][ed255]</li><li>JOSE / CRYSTALS-DILITHIUM 3 [CRYDI3][crydi3]\*</li></ul> |

\* CRYSTALS-DILITHIUM is a post-quantum resistant signature scheme, selected by NIST for [Post-Quantum Cryptography Standardization][pqc].
Support for the recently published [FIPS-204][fips] is planned for the near future.

### Exchange and transport

- OpenID4VCI (Issuance)
  - [ID-1][vci]
- OpenID4VP (Verification)
  - [v1.0][vp1.0]
  - [Draft 25][vp25]
  - [Draft 20][vp20]
  - [OID4VP over BLE][ble]; optimized version of Draft 00
  - OID4VP over MQTT; proprietary adaptation of "OID4VP over BLE" via MQTT channel
- ISO/IEC 18013
  - [18013-5][iso5]: Device engagement using either NFC or QR Code, data retrieval using BLE
  - [18013-7][iso7]: Online data retrieval via OID4VP

### Key storage

- Secure Enclave (iOS) and Android Keystore (TEE or Strongbox)
- Internal encrypted database

### Revocation methods

- [Bitstring Status List v1.0][sl]
- [Linked Validity Verifiable Credentials (LVVC)][lvvc]
- [Token Status List - Draft 03][tsl]

## Support

Need support or have feedback? [Contact us](https://www.procivis.ch/en/contact).

## Acknowledgements

Thanks to Samuel Rinnetmäki, CTO of Findynet, for the Finnish translation.

## License

Some rights reserved. This library is published under the [Apache License
Version 2.0](./LICENSE).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://assets.procivis-one.com/static/logo/logo_dark_mode_Procivis.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://assets.procivis-one.com/static/logo/logo_light_mode_Procivis.svg">
  <img alt="Shows a Procivis black logo in light color mode and a white one in dark color mode." src="https://assets.procivis-one.com/static/logo/logo_dark_mode_Procivis.svg">
</picture>

© Procivis AG, [https://www.procivis.ch](https://www.procivis.ch).

[archi]: https://github.com/procivis#architecture
[bbs]: https://www.w3.org/TR/vc-di-bbs/
[bbs2023]: https://www.w3.org/TR/vc-di-bbs/#bbs-2023
[ble]: https://openid.net/specs/openid-4-verifiable-presentations-over-ble-1_0.html
[canivc]: https://canivc.com/implementations/procivis-one-core/
[comp]: https://github.com/procivis/one-react-native-components
[core]: https://github.com/procivis/one-core
[cose]: https://www.rfc-editor.org/rfc/rfc9052
[crydi3]: https://datatracker.ietf.org/doc/html/draft-ietf-cose-dilithium-01
[docs]: https://docs.procivis.ch/
[ecd]: https://www.w3.org/TR/vc-di-ecdsa/
[ecd2019]: https://www.w3.org/TR/vc-di-ecdsa/#ecdsa-rdfc-2019
[edd]: https://www.w3.org/TR/vc-di-eddsa/
[edd2022]: https://www.w3.org/TR/vc-di-eddsa/#eddsa-rdfc-2022
[ed255]: https://datatracker.ietf.org/doc/html/rfc8037
[es2]: https://datatracker.ietf.org/doc/html/rfc7518
[eudiwi]: https://issuer.eudiw.dev/
[eudiwv]: https://verifier.eudiw.dev/home
[fips]: https://csrc.nist.gov/pubs/fips/204/final
[iso5]: https://www.iso.org/standard/69084.html
[iso7]: https://www.iso.org/standard/82772.html
[jld]: https://www.w3.org/TR/json-ld11/
[jose]: https://w3c.github.io/vc-jose-cose/
[jw]: https://datatracker.ietf.org/doc/html/rfc7519
[key]: https://github.com/procivis#key-features
[lvvc]: https://eprint.iacr.org/2022/1658.pdf
[owf]: https://github.com/openwallet-foundation-labs/identity-credential
[pow]: https://github.com/procivis/one-wallet
[pqc]: https://csrc.nist.gov/pqc-standardization
[rncore]: https://github.com/procivis/react-native-one-core
[sdjwt]: https://www.ietf.org/archive/id/draft-ietf-oauth-selective-disclosure-jwt-12.html
[sdjwtvc]: https://www.ietf.org/archive/id/draft-ietf-oauth-sd-jwt-vc-05.html
[sdkref]: https://docs.procivis.ch/sdk
[sl]: https://www.w3.org/TR/vc-bitstring-status-list/
[trial]: https://docs.procivis.ch/trial
[tsl]: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-status-list-03
[vcdi]: https://www.w3.org/TR/vc-data-integrity/
[vcdm]: https://www.w3.org/TR/vc-data-model-2.0/
[vci]: https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-ID1.html
[vp1.0]: https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html
[vp20]: https://openid.net/specs/openid-4-verifiable-presentations-1_0-20.html
[vp25]: https://openid.net/specs/openid-4-verifiable-presentations-1_0-25.html
