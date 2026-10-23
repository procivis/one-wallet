import SwiftUI
import ProcivisOneCore

struct SimpleSetsView: View {
    
    let credentialSets: [Document_Provider.CredentialSet]
    let credentialQueries: [String: ProcivisOneCore.CredentialQuery]
    @Binding private(set) var selection: ProofRequestSelection
    
    var body: some View {
        VStack {
            ForEach(Array(credentialSets.enumerated()), id: \.element.id) { index, set in
                if let credentialQueryId = set.options.first?.first,
                   let credentialQuery = credentialQueries[credentialQueryId] {
                    RequestedCredentialView(
                        credentialQueryId: credentialQueryId,
                        credentialQuery: credentialQuery,
                        selection: $selection,
                        last: index == credentialSets.count - 1,
                        expandable: true,
                        initiallyExpanded: index == 0,
                    )
                }
            }
        }
        .onAppear(perform: initialSelection)
    }
    
    private func initialSelection() {
        credentialSets.forEach { set in
            selection.setsSelectedOptions[set.id] = 0
        }
    }
}
