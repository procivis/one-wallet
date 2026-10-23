import ProcivisOneCore

struct ProofRequest: Equatable, Hashable {
    
    let interactionId: String
    let proofId: String
    let verificationProtocol: String
}

extension HandleInvitationResponse {
    
    var proofRequestProps: ProofRequest? {
        guard case let .proofRequest(interactionId, proofId, verificationProtocol, _, _) = self else { return nil }
        return ProofRequest(
            interactionId: interactionId,
            proofId: proofId,
            verificationProtocol: verificationProtocol,
        )
    }
}
