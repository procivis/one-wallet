import SwiftUI
import ProcivisOneCore

protocol CredentialCardViewModelProviding {
    
    var schema: CredentialSchemaListItem { get }
    
    var headerPrimary: String? { get }
    var headerPrimaryColor: Color? { get }
    var headerSecondary: String? { get }
    var headerSecondaryColor: Color? { get }
    var batchCount: Int? { get }
    func credentialHeaderViewModel(language: String) -> CredentialHeaderView.ViewModel
    func credentialCardViewModel(language: String) -> CredentialCardView.ViewModel
}

extension CredentialCardViewModelProviding {
    
    var headerPrimary: String? { nil }
    var headerPrimaryColor: Color? { nil }
    var headerSecondary: String? { nil }
    var headerSecondaryColor: Color? { nil }
    var batchCount: Int? { nil }
    
    func credentialHeaderViewModel(language: String) -> CredentialHeaderView.ViewModel {
        guard let layoutProperties = schema.layoutProperties else {
            return CredentialHeaderView.ViewModel(
                logo: .default,
                name: schema.translations?.name[language] ?? schema.translations?.name["en"] ?? schema.name,
                primary: headerPrimary,
                primaryColor: headerPrimaryColor,
                secondary: headerSecondary,
                secondaryColor: headerSecondaryColor,
            )
        }
        return CredentialHeaderView.ViewModel(
            logo: layoutProperties.credentialHeaderLogo,
            name: schema.name,
            primary: headerPrimary,
            primaryColor: headerPrimaryColor,
            secondary: headerSecondary,
            secondaryColor: headerSecondaryColor,
        )
    }
    
    func credentialCardViewModel(language: String) -> CredentialCardView.ViewModel {
        guard let layoutProperties = schema.layoutProperties else {
            return CredentialCardView.ViewModel(
                header: self.credentialHeaderViewModel(language: language),
                background: .default,
                batchCount: batchCount,
            )
        }
        return CredentialCardView.ViewModel(
            header: self.credentialHeaderViewModel(language: language),
            background: layoutProperties.credentialCardBackground,
            batchCount: batchCount,
        )
    }
}

extension CredentialListItem: CredentialCardViewModelProviding {
    
    var headerPrimary: String? {
        if let date = DateFormatterProvider().isoDateFormatter.date(from: createdDate) {
            return DateFormatterProvider().dateFormatter.string(from: date)
        } else {
            return nil
        }
    }
    
    var headerSecondary: String? {
        return state.credentialListStatus
    }
    
    var headerSecondaryColor: Color? {
        return state.credentialListStatusColor
    }
}

extension CredentialQueryFailureHint: CredentialCardViewModelProviding {

    var schema: CredentialSchemaListItem {
        return CredentialSchemaListItem(
            id: "",
            createdDate: "",
            lastModified: "",
            name: credentialSchema?.name ?? LocalizedStringKey("Unknown credential").localizedStringValue,
            formats: [],
            walletAttestation: CredentialSchemaWalletAttestation(
                requireInstanceAttestation: false,
                keyStorageSecurityLevel: nil,
                preferredKeyStorageAttestationLifetime: nil,
                preferredInstanceAttestationLifetime: nil
            ),
            importedSourceUrl: "",
            layoutProperties: credentialSchema?.layoutProperties,
            allowSuspension: false,
            allowRevocation: nil,
            batchSize: nil,
            expiration: nil,
            ecosystem: nil,
            translations: credentialSchema?.translations
        )
    }
    
    var headerPrimary: String? {
        switch (reason) {
        case .validity:
            return LocalizedStringKey("No valid credential available").localizedStringValue
        case .noCredential:
            return LocalizedStringKey("Credential missing").localizedStringValue
        case .constraint:
            return LocalizedStringKey("Missing attribute").localizedStringValue
        default:
            return LocalizedStringKey("Unknown issue").localizedStringValue
        }
    }
    
    var headerPrimaryColor: Color? {
        return Color.scheme.errorText
    }
}

