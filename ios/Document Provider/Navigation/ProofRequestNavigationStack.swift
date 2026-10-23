import SwiftUI
import Combine
import SwiftData
import ProcivisOneCore

struct ProofRequestNavigationStack: View {

    enum ProofRequestRoute: Hashable {
        case credentialSelection(credentialQueryId: String, credentialQuery: ProcivisOneCore.CredentialQuery)
    }
    
    class ProofRequestNavigationViewModel: ObservableObject {
        
        @Binding private var path: NavigationPath
        private let initialPath: NavigationPath
        
        init(path: Binding<NavigationPath>) {
            _path = path
            initialPath = path.wrappedValue
        }
        
        func navigateToProofRequest() {
            path = initialPath
        }
        
        func navigateToCredentialSelection(credentialQueryId: String, credentialQuery: ProcivisOneCore.CredentialQuery) {
            path.append(ProofRequestRoute.credentialSelection(credentialQueryId: credentialQueryId, credentialQuery: credentialQuery))
        }
    }

    @StateObject var proofRequestNavigation: ProofRequestNavigationViewModel
    
    private let proofRequest: ProofRequest
    private let hideNavigationBars: Bool
    private let onDismiss: (() -> Void)?
    
    @State private var selection = ProofRequestSelection()
    
    init(proofRequest: ProofRequest, hideNavigationBars: Bool = false, onDismiss: (() -> Void)? = nil, path: Binding<NavigationPath>) {
        self.proofRequest = proofRequest
        self.hideNavigationBars = hideNavigationBars
        self.onDismiss = onDismiss
        _proofRequestNavigation = StateObject(wrappedValue: ProofRequestNavigationViewModel(path: path))
    }

    var body: some View {
        ProofRequestView(proofRequest: proofRequest, onDismiss: onDismiss, selection: $selection)
            .environmentObject(proofRequestNavigation)
            .toolbarVisibility(hideNavigationBars ? .hidden : .automatic, for: .navigationBar)
        .navigationDestination(for: ProofRequestRoute.self) { route in
            switch route {
            case .credentialSelection(let credentialQueryId, let credentialQuery):
                CredentialSelectView(credentialQueryId: credentialQueryId, credentialQuery: credentialQuery, selection: $selection)
                    .environmentObject(proofRequestNavigation)
                    .toolbarVisibility(hideNavigationBars ? .hidden : .automatic, for: .navigationBar)
            }
        }
    }
}
