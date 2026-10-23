import SwiftUI
import ProcivisOneCore

struct OptionSetView: View {
    
    let credentialSet: Document_Provider.CredentialSet
    let credentialQueries: [String: ProcivisOneCore.CredentialQuery]
    @Binding private(set) var selection: ProofRequestSelection
    
    var body: some View {
        VStack {
            ForEach(Array(credentialSet.options.enumerated()), id: \.offset) { index, option in
                OptionSetGroupView(
                    setId: credentialSet.id,
                    optional: !credentialSet.required,
                    setOptionIndex: index,
                    queryIds: option,
                    credentialQueries: credentialQueries,
                    selection: $selection,
                    last: index == credentialSet.options.count - 1,
                )
            }
        }
        .onAppear(perform: initialSelection)
    }
    
    private func initialSelection() {
        guard selection.setsSelectedOptions[credentialSet.id] == nil, credentialSet.required else {
            return
        }
        selection.setsSelectedOptions[credentialSet.id] = 0
    }
}
