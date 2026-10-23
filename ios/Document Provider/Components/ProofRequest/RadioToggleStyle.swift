import SwiftUI

struct RadioToggleStyle: ToggleStyle {
    
    func makeBody(configuration: Configuration) -> some View {
        Button {
            configuration.isOn.toggle()
        } label: {
            HStack {
                configuration.label
                Image(systemName: "circle.fill")
                    .foregroundStyle(Color.scheme.secondaryText)
                    .scaleEffect(1.2)
                    .overlay(alignment: .center) {
                        Image(systemName: "circle.fill")
                            .foregroundStyle(Color.scheme.text)
                            .scaleEffect(1.1)
                            .overlay(alignment: .center) {
                                if configuration.isOn {
                                    Image(systemName: "circle.fill")
                                        .foregroundStyle(Color.scheme.textBackground)
                                        .scaleEffect(0.5)
                                }
                            }
                    }
            }
        }
        .tint(.primary)
        .buttonStyle(.borderless)
    }
}

#Preview {
    Toggle("Selected", isOn: .constant(true))
        .toggleStyle(RadioToggleStyle())
    Toggle("Unselected", isOn: .constant(false))
        .toggleStyle(RadioToggleStyle())
}
