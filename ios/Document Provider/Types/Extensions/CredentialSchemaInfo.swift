import ProcivisOneCore

extension CredentialSchemaInfo {
    
    var schemaListItem: CredentialSchemaListItem {
        return CredentialSchemaListItem(
            id: self.id,
            createdDate: self.createdDate,
            lastModified: self.lastModified,
            name: self.name,
            formats: [CredentialSchemaFormatResponse(format: self.format, ecosystemSchemaId: self.schemaId)],
            walletAttestation: CredentialSchemaWalletAttestation(
                requireInstanceAttestation: self.requiresWalletInstanceAttestation,
                keyStorageSecurityLevel: self.keyStorageSecurity,
                preferredKeyStorageAttestationLifetime: nil,
                preferredInstanceAttestationLifetime: nil
            ),
            importedSourceUrl: self.importedSourceUrl,
            layoutProperties: self.layoutProperties,
            allowSuspension: self.allowSuspension,
            allowRevocation: false,
            batchSize: nil,
            expiration: nil,
            ecosystem: nil,
            translations: self.translations,
        )
    }
}
