import SwiftUI

extension View {
    
    @inlinable
    func baseButtonStyle(
        isEnabled: Bool,
        foreground: Color = .scheme.accentText,
        background: Color = .scheme.accent,
        border: Color = .clear,
        paddingHorizontal: CGFloat = 16,
        paddingVertical: CGFloat = 16,
        shadow: Bool = true,
    ) -> some View {
        return self
            .frame(maxWidth: .infinity)
            .padding(.horizontal, paddingHorizontal)
            .padding(.vertical, paddingVertical)
            .background(background)
            .foregroundColor(foreground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(border, lineWidth: 1)
            )
            .opacity(isEnabled ? 1 : 0.4)
    }
    
    @inlinable
    func primaryButtonStyle(configuration: ButtonStyleConfiguration, isEnabled: Bool) -> some View {
        return self.baseButtonStyle(isEnabled: isEnabled, background: configuration.isPressed ? .scheme.accent.opacity(0.8) : .scheme.accent)
            .animation(.smooth(duration: 0.2), value: configuration.isPressed)
    }
    
    @inlinable
    func secondaryButtonStyle(configuration: ButtonStyleConfiguration, isEnabled: Bool) -> some View {
        return self.baseButtonStyle(isEnabled: isEnabled,
                                    foreground: .scheme.text,
                                    background: configuration.isPressed ? .scheme.background : .white)
        .animation(.smooth(duration: 0.1), value: configuration.isPressed)
    }
    
    @inlinable
    func borderedButtonStyle(configuration: ButtonStyleConfiguration, isEnabled: Bool) -> some View {
        return self.baseButtonStyle(isEnabled: isEnabled,
                                    foreground: .scheme.text,
                                    background: configuration.isPressed ? .scheme.grayBackground : .white,
                                    border: .scheme.grayBackground)
        .animation(.smooth(duration: 0.1), value: configuration.isPressed)
    }
}

struct PrimaryButton: ButtonStyle {
    
    @Environment(\.isEnabled)
    private var isEnabled: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .primaryButtonStyle(configuration: configuration, isEnabled: isEnabled)
    }
}

struct SecondaryButton: ButtonStyle {
    
    @Environment(\.isEnabled)
    private var isEnabled: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .secondaryButtonStyle(configuration: configuration, isEnabled: isEnabled)
    }
}

struct BorderedButton: ButtonStyle {
    
    @Environment(\.isEnabled)
    private var isEnabled: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .borderedButtonStyle(configuration: configuration, isEnabled: isEnabled)
    }
}

#Preview {
    
    VStack(spacing: 40) {
        Button("Primary button", action: {})
            .buttonStyle(PrimaryButton())
        Button("Secondary button", action: {})
            .buttonStyle(SecondaryButton())
        Button("Bordered button", action: {})
            .buttonStyle(BorderedButton())
    }
    .padding(.horizontal, 28)
    .padding(.vertical, 100)
    .background(Color.scheme.backgroundScroll)
}
