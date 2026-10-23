import Foundation
import ProcivisOneCore

struct CredentialSet: Identifiable, Equatable {
    
    public let id = UUID()
    
    public let valid: Bool
    
    public let required: Bool

    public let options: [[String]]
    
    init(with credentialSet: ProcivisOneCore.CredentialSet, credentialQueries: [String: ProcivisOneCore.CredentialQuery]) {
        let filteredOptions = credentialSet.options.filter { group in
            group.allSatisfy { queryId in
                guard let query = credentialQueries[queryId],
                      case let .applicableCredentials(applicableCredentials, _) = query.credentialOrFailureHint else {
                    return false
                }
                return applicableCredentials.isEmpty == false
            }
        }
        self.valid = filteredOptions.isEmpty == false
        self.options = filteredOptions.isEmpty ? credentialSet.options : filteredOptions
        self.required = credentialSet.required
    }
}
