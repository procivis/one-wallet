import SwiftUI

struct ChevronToggleStyle: ToggleStyle {
    
    func makeBody(configuration: Configuration) -> some View {
        Button {
            configuration.isOn.toggle()
        } label: {
            HStack {
                configuration.label
                Image(systemName: "chevron.up")
                    .foregroundStyle(Color.scheme.text)
                    .rotationEffect(.degrees(configuration.isOn ? 0 : 180))
                    .animation(.easeInOut, value: configuration.isOn)
            }
        }
        .tint(.primary)
        .buttonStyle(.borderless)
    }
}

#Preview {
    Toggle("Expanded", isOn: .constant(true))
        .toggleStyle(ChevronToggleStyle())
    Toggle("Collapsed", isOn: .constant(false))
        .toggleStyle(ChevronToggleStyle())
}
