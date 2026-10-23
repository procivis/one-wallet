import SwiftUI
import ProcivisOneCore

struct PresentationDefinitionView: View {
    
    let presentationDefinition: PresentationDefinition
    
    @Binding private(set) var selection: ProofRequestSelection
    
    var body: some View {
        if !presentationDefinition.sortedSets.simpleSets.isEmpty {
            SimpleSetsView(
                credentialSets: presentationDefinition.sortedSets.simpleSets,
                credentialQueries: presentationDefinition.credentialQueries,
                selection: $selection,
            )
        }
        ForEach(Array(presentationDefinition.sortedSets.optionSets.enumerated()), id: \.element.id) { index, optionSet in
            VStack {
                if index > 0 {
                    Divider()
                        .padding(.top, 16)
                }
                HStack() {
                    Text("Set \(index + 1) - Please select one option.\(optionSet.required ? "" : " [" + String(localized: "optional") + "]")")
                        .foregroundStyle(Color.scheme.text)
                    Spacer()
                }
                .frame(height: 60)
                OptionSetView(credentialSet: optionSet, credentialQueries: presentationDefinition.credentialQueries, selection: $selection)
            }
        }
    }
}
