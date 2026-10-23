import Foundation
import ProcivisOneCore

struct ProofRequestSelection: Equatable {
    
    var setsSelectedOptions: [UUID: Int] = [:]
    var queriesSelectedCredentials: [String: [String]] = [:]
    var credentialsUserSelections: [String: [String]] = [:]
}

extension ProofRequestSelection {
    
    func canSubmit(credentialSets: [CredentialSet], credentialQueries: [String: ProcivisOneCore.CredentialQuery]) -> Bool {
        for set in credentialSets {
            guard set.valid,
                  let selectedOptionIndex = setsSelectedOptions[set.id] else {
                return false
            }
            let selectedOption = set.options[selectedOptionIndex]
            for queryId in selectedOption {
                guard let credentialIds = queriesSelectedCredentials[queryId],
                      let credentialQuery = credentialQueries[queryId],
                      case let .applicableCredentials(applicableCredentials, _) = credentialQuery.credentialOrFailureHint else {
                    return false
                }
                for credentialId in credentialIds {
                    guard let credential = applicableCredentials.first(where: { credential in
                        credential.id == credentialId
                    }) else {
                        return false
                    }
                    let nonSelectableClaims = credential.claims.filter { claim in
                        !claim.userSelection
                    }
                    if nonSelectableClaims.isEmpty && (credentialsUserSelections[credentialId] ?? []).isEmpty {
                        return false
                    }
                }
            }
        }
        return true
    }
    
    func submission(credentialSets: [CredentialSet]) -> [String: [PresentationSubmitV2CredentialRequest]] {
        var submission: [String: [PresentationSubmitV2CredentialRequest]] = [:]
        credentialSets.forEach { set in
            guard set.valid,
                  let selectedOptionIndex = setsSelectedOptions[set.id] else {
                return
            }
            let selectedOption = set.options[selectedOptionIndex]
            selectedOption.forEach { queryId in
                guard let credentialIds = queriesSelectedCredentials[queryId] else {
                    return
                }
                submission[queryId] = credentialIds.map { credentialId in
                    return PresentationSubmitV2CredentialRequest(
                        credentialId: credentialId,
                        userSelections: credentialsUserSelections[credentialId] ?? [],
                        transactionDataIds: nil,
                    )
                }
            }
        }
        return submission
    }
}
