import SwiftUI

struct CheckboxToggleStyle: ToggleStyle {
    
    private struct AttributeToggleButton: View {
        
        let configuration: Configuration
        @Environment(\.isEnabled)
        private var isEnabled: Bool
        
        var body: some View {
            Button {
                configuration.isOn.toggle()
            } label: {
                HStack {
                    configuration.label
                    if !isEnabled {
                        if configuration.isOn {
                            Image(systemName: "checkmark")
                                .scaleEffect(0.6)
                                .foregroundStyle(Color.scheme.text)
                        } else {
                            EmptyView()
                        }
                    } else {
                        Image(systemName: "circle.fill")
                            .foregroundStyle(Color.scheme.secondaryText)
                            .scaleEffect(1.2)
                            .overlay(alignment: .center) {
                                Image(systemName: "circle.fill")
                                    .foregroundStyle(Color.scheme.textBackground)
                                    .scaleEffect(1.1)
                                    .overlay(alignment: .center) {
                                        if configuration.isOn {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(Color.scheme.text)
                                                .scaleEffect(1.1)
                                        }
                                    }
                            }
                    }
                }
            }
            .tint(.primary)
            .buttonStyle(.borderless)
        }
    }
    
    func makeBody(configuration: Configuration) -> some View {
        AttributeToggleButton(configuration: configuration)
    }
}

#Preview {
    Toggle("Selected disabled", isOn: .constant(true))
        .toggleStyle(CheckboxToggleStyle())
        .disabled(true)
    Toggle("Unselected disabled", isOn: .constant(false))
        .toggleStyle(CheckboxToggleStyle())
        .disabled(true)
    Toggle("Selected enabled", isOn: .constant(true))
        .toggleStyle(CheckboxToggleStyle())
        .disabled(false)
    Toggle("Unselected enabled", isOn: .constant(false))
        .toggleStyle(CheckboxToggleStyle())
        .disabled(false)
}
