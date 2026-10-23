import SwiftUI
import IdentityDocumentServices
import IdentityDocumentServicesUI
import CoreModules
import ProcivisOneCore
import OSLog

@Observable
final class ResponseHandler: DcApiResponseHandler {
    
    var continuation: CheckedContinuation<Data, Never>?
    
    private let context: ISO18013MobileDocumentRequestContext
    
    init(context: ISO18013MobileDocumentRequestContext) {
        self.context = context
    }
    
    func onSubmit(response: String) throws {
        guard let continuation,
              let responseData = Data(base64URLEncoded: response) else {
            context.cancel()
            return
        }
        continuation.resume(returning: responseData)
    }
    
    func onReject() throws {
        context.cancel()
    }
}

struct DocumentProviderView: View {
    
    enum ProviderError: Error {
        case rawRequestParsingError
        case missingOrigin
        case invalidInvitation
        case presentationDefinitionError
        case unknown
    }
    
    struct Document: Identifiable {
        
        let id: String
        let name: String
    }
    
    let context: ISO18013MobileDocumentRequestContext
    private let store = IdentityDocumentProviderRegistrationStore()
    private var responseHandler: ResponseHandler!
    
    @State private var path = NavigationPath()
    @State private var oneCore: OneCore?
    @State private var proofRequest: ProofRequest?
    @State private var credentials: [CredentialListItem] = []
    
    init(context: ISO18013MobileDocumentRequestContext) {
        self.context = context
        self.responseHandler = ResponseHandler(context: context)
    }
    
    var body: some View {
        Group {
            if let proofRequest, let oneCore {
                NavigationStack(path: $path) {
                    ProofRequestNavigationStack(proofRequest: proofRequest, hideNavigationBars: true, onDismiss: self.context.cancel, path: $path)
                        .environmentObject(oneCore)
                }
            } else {
                LoadingResultView()
            }
        }
        .task {
            do {
                self.oneCore = try OneCore()
                try await context.sendResponse { rawRequest in
                    try await self.handleProofRequest(rawRequest: rawRequest)
                    let responseData: Data = await withCheckedContinuation { continuation in
                        Task { @MainActor in
                            self.responseHandler.continuation = continuation
                        }
                    }
                    return ISO18013MobileDocumentResponse(responseData: responseData)
                }
            } catch {
                NSLog("Error: \(error)")
            }
        }
    }
    
    @MainActor
    private func handleProofRequest(rawRequest: IdentityDocumentWebPresentmentRawRequest) async throws {
        guard let request = try JSONSerialization.jsonObject(with: rawRequest.requestData, options: []) as? [String: String],
              let deviceRequest = request["deviceRequest"],
              let encryptionInfo = request["encryptionInfo"] else {
            throw ProviderError.rawRequestParsingError
        }
        guard let origin = context.requestingWebsiteOrigin?.absoluteString else {
            throw ProviderError.missingOrigin
        }
        let invitationResult = try await oneCore?.handleInvitation(
            data: .iso18013DcApi(
                deviceRequest: deviceRequest,
                encryptionInfo: encryptionInfo,
                origin: origin,
                responseHandler: self.responseHandler,
            )
        )
        guard let proofRequest = invitationResult?.proofRequestProps else {
            throw ProviderError.invalidInvitation
        }
        self.proofRequest = proofRequest
    }
}
