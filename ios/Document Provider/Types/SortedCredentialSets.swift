import Foundation
import ProcivisOneCore

struct SortedCredentialSets {
    
    public let simpleSets: [Document_Provider.CredentialSet]
    
    public let optionSets: [Document_Provider.CredentialSet]
    
    init(with credentialSets: [Document_Provider.CredentialSet]) {
        let simpleSets = credentialSets.filter { set in
            guard set.options.count == 1,
                  let firstOption = set.options.first,
                  firstOption.count == 1 else {
                return false
            }
            return true
        }
        self.simpleSets = simpleSets
        self.optionSets = credentialSets.filter { set in
            simpleSets.contains(where: { $0.id == set.id }) == false &&
            (set.valid || set.required)
        }
    }
}
