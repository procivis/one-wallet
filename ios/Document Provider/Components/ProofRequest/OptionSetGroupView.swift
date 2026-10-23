import SwiftUI
import ProcivisOneCore

struct OptionSetGroupView: View {
    
    @Environment(\.colorScheme)
    private var colorScheme
    
    let setId: UUID
    let optional: Bool
    let setOptionIndex: Int
    let queryIds: [String]
    let credentialQueries: [String: ProcivisOneCore.CredentialQuery]
    @Binding private(set) var selection: ProofRequestSelection
    let last: Bool
    @State private var size: CGSize = .zero
    
    private var collapsedHeight: CGFloat {
        CGFloat(queryIds.count - 1) * 64 + (last ? size.width / CredentialCardView.aspectRatio : 60) + (wrapCredentials ? 64 : 0)
    }
    
    private var wrapCredentials: Bool {
        return queryIds.count > 1
    }
    
    var body: some View {
        let selected = Binding {
            selection.setsSelectedOptions[setId] == setOptionIndex
        } set: { selected in
            if selected {
                selection.setsSelectedOptions[setId] = setOptionIndex
            } else if optional {
                selection.setsSelectedOptions[setId] = nil
            }
        }
        
        ScrollView {
            VStack(spacing: 4) {
                if wrapCredentials {
                    HStack {
                        Text("Combined credentials")
                            .foregroundStyle(Color.scheme.textBackground)
                            .frame(height: 60)
                        Spacer()
                    }
                    .padding(.horizontal, 8)
                }
                VStack(spacing: 4) {
                    ForEach(Array(queryIds.enumerated()), id: \.offset) { index, credentialQueryId in
                        if let credentialQuery = credentialQueries[credentialQueryId] {
                            RequestedCredentialView(
                                credentialQueryId: credentialQueryId,
                                credentialQuery: credentialQuery,
                                selection: $selection,
                                last: index == queryIds.count - 1,
                                expandable: selection.setsSelectedOptions[setId] == setOptionIndex && wrapCredentials,
                                expanded: selection.setsSelectedOptions[setId] == setOptionIndex ?
                                (queryIds.count == 1 ? Binding.constant(true) : nil) :
                                    Binding.constant(false),
                                showMultiCredentialHeader: false,
                            )
                        }
                    }
                }
                .cornerRadius(12)
                .padding(wrapCredentials ? 4 : 0)
            }
            .cornerRadius(wrapCredentials ? 16 : 12)
            .background(
                Color.clear
                    .background(.ultraThickMaterial)
                    .environment(\.colorScheme, colorScheme == .dark ? .light : .dark)
                    .cornerRadius(wrapCredentials ? 16 : 12)
            )
            .shadow(color: Color.scheme.shadow, radius: 7, x: 0, y: 5)
            .onGeometryChange(for: CGSize.self, of: \.size) { newSize in
                self.size = newSize
            }
            .overlay(alignment: .top) {
                Toggle(isOn: selected.animation()) {
                    HStack {
                        Spacer()
                    }
                    .frame(height: 60)
                }
                .toggleStyle(RadioToggleStyle())
                .padding(.horizontal, 16)
            }
        }
        .scrollDisabled(true)
        .scrollClipDisabled()
        .scrollContentBackground(.hidden)
        .frame(height: selected.wrappedValue ? size.height : collapsedHeight)
        .animation(.easeInOut, value: selected.wrappedValue)
    }
}
