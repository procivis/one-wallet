import SwiftUI
import IdentityDocumentServices
import IdentityDocumentServicesUI
import CoreModules
import ProcivisOneCore
import OSLog

struct DocumentProviderView: View {
    
    enum ProviderError: Error {
        case unknown
    }
    
    struct Document: Identifiable {
        
        let id: String
        let name: String
    }
    
    let context: ISO18013MobileDocumentRequestContext
    private let store = IdentityDocumentProviderRegistrationStore()
    
    @State var oneCore: OneCore?
    @State private var credentials: [CredentialListItem] = []
    
    var body: some View {
        VStack(alignment: .center, spacing: 10) {
            if let url = context.requestingWebsiteOrigin?.absoluteString {
                Image(systemName: "globe")
                    .font(.system(size: 26))
                    .foregroundStyle(Color.scheme.text.opacity(0.6))
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(Color.scheme.background)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.scheme.grayDark.opacity(0.7), lineWidth: 1)
                            )
                    )
                Text("Share with \(url)?")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(Color.scheme.text)
                    .padding(.horizontal)
                    .padding(.top, 10)
                Text("Only share if you trust this website")
                    .font(.system(size: 16))
                    .foregroundStyle(Color.scheme.secondaryText)
                    .padding(.horizontal)
                    .padding(.bottom, 10)
            }
            List {
                ForEach(Array(credentials.enumerated()), id: \.offset) { index, credential in
                    ScrollView {
                        CredentialCardView(viewModel: credential.credentialCardViewModel(language: Locale.current.identifier))
                            .cornerRadius(12)
                            .frame(maxWidth: .infinity)
                            .shadow(color: Color.scheme.shadow, radius: 7, x: 0, y: 5)
                    }
                    .zIndex(Double(index))
                    .frame(height: credential == credentials.last ? nil : 60)
                    .scrollDisabled(true)
                    .scrollClipDisabled()
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .listRowInsets(.init(top: 0, leading: 12, bottom: 8, trailing: 12))
                }
            }
            .listStyle(.plain)
            .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
            Button("Submit") {
                context.cancel()
            }
            .buttonStyle(PrimaryButton())
            .padding([.horizontal])
            Button("Cancel") {
                context.cancel()
            }
            .buttonStyle(BorderedButton())
            .padding([.bottom, .horizontal])
        }
        .task {
            do {
                self.oneCore = try OneCore()
                let credentials = try await oneCore?.getCredentials(formats: ["MDOC"])
                let requestedTypes = context.request.presentmentRequests.flatMap { presentmentRequest in
                    presentmentRequest.documentRequestSets.flatMap { requestSet in
                        requestSet.requests.flatMap { request in
                            request.documentType
                        }
                    }
                }
                self.credentials = credentials?.values.filter({ credential in
                    return credential.state == .accepted && credential.schema.formats.first(where: { format in
                        return requestedTypes.contains(format.ecosystemSchemaId)
                    }) != nil
                }) ?? []
            } catch {
                NSLog("Error: \(error)")
            }
        }
    }
}
