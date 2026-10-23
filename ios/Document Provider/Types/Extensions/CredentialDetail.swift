import SwiftUI
import ProcivisOneCore

protocol CredentialDetailViewModelProviding: CredentialCardViewModelProviding {
    
    var createdDate: String { get }
    var state: ProcivisOneCore.CredentialState { get }
    var parseableClaims: [CredentialAttributeViewModelProviding] { get }
    
    func credentialDetailViewModel(language: String) -> CredentialDetailCardView.ViewModel
}

extension CredentialDetailViewModelProviding {
    
    var headerPrimary: String? {
        if state == .revoked || state == .suspended,
           let date = DateFormatterProvider().isoDateFormatter.date(from: createdDate) {
            return DateFormatterProvider().dateFormatter.string(from: date)
        }
        if let layoutProperties = schemaListItem.layoutProperties,
           let primaryAttributeName = layoutProperties.primaryAttribute,
           let primaryClaim = self.parseableClaims.first(where: { $0.path == primaryAttributeName }) {
            return primaryClaim.parseableValue.readableValue
        }
        return nil
    }
    
    var headerSecondary: String? {
        if state == .revoked || state == .suspended {
            return state.credentialListStatus
        }
        if let layoutProperties = schemaListItem.layoutProperties,
           let secondaryAttributeName = layoutProperties.secondaryAttribute,
           let secondaryClaim = self.parseableClaims.first(where: { $0.path == secondaryAttributeName }) {
            return secondaryClaim.parseableValue.readableValue
        }
        return nil
    }
    
    var headerSecondaryColor: Color? {
        return state.credentialListStatusColor
    }
    
    func credentialDetailViewModel(language: String) -> CredentialDetailCardView.ViewModel {
        return CredentialDetailCardView.ViewModel(
            card: self.credentialCardViewModel(language: language),
            attributes: self.parseableClaims.map { claim in
                claim.attributeViewModel(language: language)
            },
        )
    }
}

extension CredentialDetail: CredentialDetailViewModelProviding {
    
    var schemaListItem: CredentialSchemaListItem {
        return self.schema
    }
    
    var parseableClaims: [any CredentialAttributeViewModelProviding] {
        return self.claims
    }
    
    var batchCount: Int? {
        return self.type == .batchParent ? Int(self.remainingBatchItemCount?.map({ $0.value }).reduce(0, +) ?? 0) : nil
    }
}

extension PresentationDefinitionV2Credential: CredentialDetailViewModelProviding {
    
    var schemaListItem: CredentialSchemaListItem {
        return self.schema.schemaListItem
    }
    
    var parseableClaims: [any CredentialAttributeViewModelProviding] {
        return self.claims
    }
    
}
