import SwiftUI
import ProcivisOneCore

struct CredentialSelectView: View {
    
    @Environment(\.presentationMode)
    private var presentationMode: Binding<PresentationMode>
    @Environment(\.locale)
    var locale: Locale
    
    let credentialQueryId: String
    let credentialQuery: ProcivisOneCore.CredentialQuery
    @Binding var selection: ProofRequestSelection
    
    private var credentials: [PresentationDefinitionV2Credential] {
        guard case let .applicableCredentials(applicableCredentials, _) = credentialQuery.credentialOrFailureHint else {
            return []
        }
        return applicableCredentials
    }
    
    var body: some View {
        ScrollView {
            ForEach(credentials) { credential in
                let binding = Binding {
                    selection.queriesSelectedCredentials[credentialQueryId]?.contains(credential.id) ?? false
                } set: { selected in
                    switch (selected, credentialQuery.multiple) {
                    case (true, true):
                        selection.queriesSelectedCredentials[credentialQueryId]?.append(credential.id)
                    case (true, false):
                        selection.queriesSelectedCredentials[credentialQueryId] = [credential.id]
                    case (false, true):
                        if let count = selection.queriesSelectedCredentials[credentialQueryId]?.count, count > 1 {
                            selection.queriesSelectedCredentials[credentialQueryId] = selection.queriesSelectedCredentials[credentialQueryId]?.filter({ id in
                                id != credential.id
                            })
                        }
                    case (false, false):
                        break
                    }
                }

                CredentialDetailCardView(viewModel: credential.credentialDetailViewModel(language: locale.identifier))
                    .shadow(color: Color.scheme.shadow, radius: 7, x: 0, y: 5)
                    .overlay(alignment: .top) {
                        Toggle(isOn: binding) {
                            HStack {
                                Spacer()
                            }
                            .frame(height: 60)
                        }
                        .toggleStyle(CheckboxToggleStyle())
                        .padding(.horizontal, 8)
                    }
                    .padding()
            }
            Spacer(minLength: 90)
        }
        .overlay(alignment: .bottom) {
            Button(action: dismiss) {
                Text("Select")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButton())
            .padding([.bottom, .horizontal])
        }
    }
    
    private func dismiss() {
        presentationMode.wrappedValue.dismiss()
    }
}
