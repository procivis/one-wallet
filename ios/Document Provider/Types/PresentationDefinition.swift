import Foundation
import ProcivisOneCore

struct PresentationDefinition {
    
    public let valid: Bool
    
    public let credentialSets: [Document_Provider.CredentialSet]
    
    public let sortedSets: SortedCredentialSets

    public let credentialQueries: [String: ProcivisOneCore.CredentialQuery]
    
    init(with presentationDefinition: PresentationDefinitionV2) {
        let credentialSets = presentationDefinition.credentialSets.map { set in
            CredentialSet(with: set, credentialQueries: presentationDefinition.credentialQueries)
        }
        self.credentialSets = credentialSets
        self.sortedSets = SortedCredentialSets(with: credentialSets)
        self.credentialQueries = presentationDefinition.credentialQueries
        self.valid = credentialSets.allSatisfy { set in
            set.valid || !set.required
        }
    }
}

extension PresentationDefinitionV2 {
    
    var parsedPresentationDefinition: Document_Provider.PresentationDefinition {
        .init(with: self)
    }
}
