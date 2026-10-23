import SwiftUI
import ProcivisOneCore

struct RequestedCredentialView: View {
    
    struct HeightPreferenceKey: PreferenceKey {
        
        typealias Value = CGFloat
        static var defaultValue: Value = 0

        static func reduce(value: inout Value, nextValue: () -> Value) {
            value = nextValue()
        }
    }
    
    @Environment(\.colorScheme)
    private var colorScheme
    @EnvironmentObject var proofRequestNavigation: ProofRequestNavigationStack.ProofRequestNavigationViewModel
    @Environment(\.locale)
    var locale: Locale
    
    let credentialQueryId: String
    let credentialQuery: CredentialQuery
    @Binding var selection: ProofRequestSelection
    let last: Bool
    let expandable: Bool
    private var expandedBinding: Binding<Bool>?
    let showMultiCredentialHeader: Bool
    @State private var expandedState: Bool
    @State var size: CGSize = .zero
    
    private var credentials: [PresentationDefinitionV2Credential] {
        guard case let .applicableCredentials(applicableCredentials, _) = credentialQuery.credentialOrFailureHint,
              let defaultSelectedCredential = applicableCredentials.first else {
            return []
        }
        let selectedCredentials = applicableCredentials.filter { credential in
            selection.queriesSelectedCredentials[credentialQueryId]?.contains { selectedId in
                selectedId == credential.id
            } ?? false
        }
        return selectedCredentials.isEmpty ? [defaultSelectedCredential] : selectedCredentials
    }
    
    private var failuireHint: CredentialQueryFailureHint? {
        guard case let .failureHint(failureHint) = credentialQuery.credentialOrFailureHint else {
            return nil
        }
        return failureHint
    }
    
    private var expanded: Binding<Bool> {
        return expandedBinding ?? $expandedState
    }
    
    private var wrapCredentials: Bool {
        return credentials.count > 1 && showMultiCredentialHeader
    }
    
    private var collapsedHeight: CGFloat {
        CGFloat(credentials.count - 1) * 64 + (last ? size.width / CredentialCardView.aspectRatio : 60) + (wrapCredentials ? 64 : 0)
    }
    
    init(
        credentialQueryId: String,
        credentialQuery: CredentialQuery,
        selection: Binding<ProofRequestSelection>,
        last: Bool,
        expandable: Bool,
        expanded: Binding<Bool>? = nil,
        initiallyExpanded: Bool? = nil,
        showMultiCredentialHeader: Bool = true,
    ) {
        self.credentialQueryId = credentialQueryId
        self.credentialQuery = credentialQuery
        self._selection = selection
        self.last = last
        self.expandable = expandable
        self.expandedBinding = expanded
        self._expandedState = State(initialValue: initiallyExpanded ?? false)
        self.showMultiCredentialHeader = showMultiCredentialHeader
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                if wrapCredentials {
                    HStack {
                        Text("Combined credentials")
                            .foregroundStyle(Color.scheme.textBackground)
                            .frame(height: 60)
                        Spacer()
                    }
                    .padding(.horizontal, 4)
                }
                if let failuireHint {
                    CredentialCardView(viewModel: failuireHint.credentialCardViewModel(language: locale.identifier))
                } else {
                    ForEach(credentials) { credential in
                        let binding = Binding<[String]> {
                            return selection.credentialsUserSelections[credential.id] ?? []
                        } set: { value in
                            selection.credentialsUserSelections[credential.id] = value
                        }
                        
                        VStack(spacing: 0) {
                            CredentialDetailCardView(
                                viewModel: credential.credentialDetailViewModel(language: locale.identifier),
                                selection: binding,
                                expanded: expanded.wrappedValue,
                                rounded: false
                            )
                            .overlay(alignment: .top) {
                                if expandable {
                                    Toggle(isOn: expanded.animation()) {
                                        HStack {
                                            Spacer()
                                        }
                                        .frame(height: 60)
                                    }
                                    .toggleStyle(ChevronToggleStyle())
                                    .padding(.horizontal, 16)
                                }
                            }
                            if expanded.wrappedValue {
                                Divider()
                                    .padding(.horizontal, 16)
                                    .transition(.opacity)
                                VStack {
                                    Text("There is more than one version of this credential available.")
                                        .multilineTextAlignment(.center)
                                    Button("Select Version") {
                                        proofRequestNavigation.navigateToCredentialSelection(
                                            credentialQueryId: credentialQueryId,
                                            credentialQuery: credentialQuery
                                        )
                                    }
                                    .buttonStyle(BorderedButton())
                                }
                                .padding(16)
                                .background(Color.scheme.grayBackground)
                                .padding(16)
                                .cornerRadius(4)
                                .transition(.opacity)
                            }
                        }
                        .background(Color.scheme.textBackground)
                        .cornerRadius(12)
                        .padding(wrapCredentials ? 4 : 0)
                        .shadow(color: Color.scheme.shadow, radius: wrapCredentials ? 7 : 0, x: 0, y: 5)
                    }
                }
            }
            .cornerRadius(wrapCredentials ? 16 : 12)
            .background(
                Color.clear
                    .background(.ultraThickMaterial)
                    .environment(\.colorScheme, colorScheme == .dark ? .light : .dark)
                    .cornerRadius(wrapCredentials ? 16 : 12)
            )
            .shadow(color: Color.scheme.shadow, radius: 7, x: 0, y: 5)
            .onAppear(perform: initialSelection)
            .onGeometryChange(for: CGSize.self, of: \.size) { newSize in
                self.size = newSize
            }
        }
        .scrollDisabled(true)
        .scrollClipDisabled()
        .scrollContentBackground(.hidden)
        .frame(height: expanded.wrappedValue ? size.height : collapsedHeight)
        .animation(.easeInOut, value: expanded.wrappedValue)
    }
    
    private func initialSelection() {
        selection.queriesSelectedCredentials[credentialQueryId] = credentials.map(\.id)
        credentials.forEach { credential in
            selection.credentialsUserSelections[credential.id] = []
        }
    }
}

extension PresentationDefinitionV2Credential: @retroactive Identifiable {}
