import ProcivisOneCore
import Combine
import Foundation

class OneCore: ObservableObject {
    
    enum OneCoreError: Error {
        case configSerializationFailed
    }
    
    private var core: OneCoreProtocol!
    private let organisationId = "11111111-2222-3333-a444-ffffffffffff"
    
    private let config = [
        "issuanceProtocol": [
            "OPENID4VCI_FINAL1": [
                "params": [
                    "private": [
                        "encryption": CORE_ENCRYPTION
                    ]
                ]
            ],
            "OPENID4VCI_FINAL1_HAIP": [
                "params": [
                    "private": [
                        "encryption": CORE_ENCRYPTION
                    ]
                ]
            ],
            "OPENID4VCI_FINAL1_SWIYU": [
                "params": [
                    "private": [
                        "encryption": CORE_ENCRYPTION
                    ]
                ]
            ]
        ],
        "keyStorage": [
            "INTERNAL": [
                "params": [
                    "private": [
                        "encryption": CORE_ENCRYPTION
                    ]
                ]
            ],
            "SECURE_ELEMENT": [
                "display": "keyStorage.secureElement",
                "params": [ "private": [ "aliasPrefix": "ch.procivis.one.wallet.keys" ] ],
                "type": "SECURE_ELEMENT"
            ]
        ],
        "transport": [
            "BLE": [
                "enabled": false
            ],
            "HTTP": [
                "enabled": true
            ],
            "MQTT": [
                "enabled": false
            ]
        ],
        "verificationProtocol": [
            "ISO_MDL": [
                "enabled": true
            ]
        ]
    ]
    
    init() throws {
        try self.initialize()
    }
    
    func initialize() throws {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: config),
              let configJson = String(data: jsonData, encoding: .utf8) else {
            throw OneCoreError.configSerializationFailed
        }
        let appId = APP_ID as String
        let appGroupContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.\(appId)")
        let dataDirPath = appGroupContainer?.appendingPathComponent("Library", isDirectory: true).appendingPathComponent("Application Support", isDirectory: true).path
        self.core = try initializeCore(
            params: InitParams(
                configJson: configJson,
                nativeSecureElement: SecureEnclaveKeyStorage(),
                remoteSecureElement: nil,
                bleCentral: nil,
                blePeripheral: nil,
                nfcHce: nil,
                nfcScanner: nil,
                credentialManager: nil,
            ),
            dataDirPath: dataDirPath,
        )
    }
    
    func getOrganisation() async throws -> OrganisationDetail {
        return try await self.core.getOrganisation(id: organisationId)
    }
    
    func handleInvitation(data: HandleInvitationRequestData) async throws -> HandleInvitationResponse {
        return try await self.core.handleInvitation(
            request: HandleInvitationRequest(
                data: data,
                organisationId: organisationId,
                transport: nil,
                redirectUri: nil,
                ecosystem: nil,
            )
        )
    }
    
    func getCredentialDetails(credentialId: String) async throws -> CredentialDetail {
        return try await self.core.getCredential(credentialId: credentialId)
    }
    
    func getCredentials(
        page: Int = 0,
        pageSize: Int = 100,
        states: [CredentialState] = [.accepted, .suspended, .revoked],
        includeLayoutProperties: Bool = true,
        formats: [String]? = nil,
    ) async throws -> CredentialList {
        return try await self.core.listCredentials(
            query: CredentialListQuery(
                page: 0,
                pageSize: 100,
                sort: nil,
                sortDirection: nil,
                organisationId: organisationId,
                name: nil,
                profiles: nil,
                formats: formats,
                searchText: nil,
                searchType: nil,
                exact: nil,
                roles: nil,
                ids: nil,
                parentId: nil,
                states: states,
                types: [.single, .batchParent],
                include: includeLayoutProperties ? [.layoutProperties, .translations] : nil,
                credentialSchemaIds: nil,
                ecosystems: nil,
                createdDateAfter: nil,
                createdDateBefore: nil,
                lastModifiedAfter: nil,
                lastModifiedBefore: nil,
                issuanceDateAfter: nil,
                issuanceDateBefore: nil,
                revocationDateAfter: nil,
                revocationDateBefore: nil
            )
        )
    }
    
    @discardableResult
    func checkCredentialsStatus(credentialId: String? = nil, forceRefresh: Bool = false) async throws -> [CredentialRevocationCheckResponse] {
        let credentialIds: [String]
        if let credentialId {
            credentialIds = [credentialId]
        } else {
            credentialIds = try await self.getCredentials(states: [.accepted, .suspended]).values.map(\.id)
        }
        return try await self.core.checkRevocation(credentialIds: credentialIds, forceRefresh: forceRefresh)
    }
    
    func getPresentationDefinition(proofId: String) async throws -> PresentationDefinitionV2 {
        return try await self.core.getPresentationDefinitionV2(proofId: proofId)
    }
    
    func getProof(proofId: String) async throws -> ProofDetail {
        return try await self.core.getProof(proofId: proofId)
    }
    
    func submitProof(interactionId: String, submission: [String: [PresentationSubmitV2CredentialRequest]]) async throws {
        try await self.core.holderSubmitProofV2(interactionId: interactionId, submission: submission)
    }
    
    func rejectProof(interactionId: String) async throws {
        try await self.core.holderRejectProof(interactionId: interactionId)
    }
}
