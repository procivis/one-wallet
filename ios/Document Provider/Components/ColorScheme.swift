import SwiftUI

public struct ColorScheme {
    
    public struct NerdViewScheme {
        
        public let attributeLabel = Color(
            light: Color(hex: "#929497"),
            dark: Color(hex: "#A5ADB5")
        )
        public let attributeSectionBackground = Color(
            light: Color(red: 2 / 255, green: 4 / 255, blue: 1 / 255, opacity: 0.8),
            dark: Color(red: 17 / 255, green: 22 / 255, blue: 28 / 255, opacity: 0.9)
        )
        public let attributeValueBackground = Color(
            light: Color(red: 1, green: 1, blue: 1, opacity: 0.02),
            dark: Color(red: 1, green: 1, blue: 1, opacity: 0.04)
        )
        public let attributeValueBorder = Color(
            light: Color(red: 1, green: 1, blue: 1, opacity: 0.2),
            dark: Color(red: 1, green: 1, blue: 1, opacity: 0.12)
        )
        public let background = Color(
            light: Color(red: 2 / 255, green: 4 / 255, blue: 21 / 255, opacity: 0.95),
            dark: Color(red: 8 / 255, green: 11 / 255, blue: 15 / 255, opacity: 0.97)
        )
        public let button = Color(
            light: Color(red: 1, green: 1, blue: 1, opacity: 0.05),
            dark: Color(red: 1, green: 1, blue: 1, opacity: 0.08)
        )
        public let codeHighlightText = Color(
            light: Color(red: 232 / 255, green: 135 / 255, blue: 114 / 255),
            dark: Color(hex: "#FF9D85")
        )
    }
    
    public let accent = Color(
        light: Color(hex: "#0F151A"),
        dark: Color(hex: "#EBF2F4")
    )
    public let accentText = Color(
        light: Color(hex: "#EBF2F4"),
        dark: Color(hex: "#0F151A")
    )
    public let background = Color(
        light: Color(hex: "#F1F3F5"),
        dark: Color(hex: "#1F151A")
    )
    public let backgroundScroll = Color(
        light: Color(red: 241 / 255, green: 243 / 255, blue: 245 / 255, opacity: 0.7),
        dark: Color(red: 15 / 255, green: 21 / 255, blue: 26 / 255, opacity: 0.7)
    )
    public let codeAccent = Color(
        light: Color(hex: "#CFD2E7"),
        dark: Color(hex: "#2A3140")
    )
    public let credentialHeaderBackground = Color(
        light: Color(red: 1, green: 1, blue: 1, opacity: 0.87),
        dark: Color(red: 20 / 255, green: 27 / 255, blue: 33 / 255, opacity: 0.92)
    )
    public let error = Color(
        light: Color(hex: "#D90D0D"),
        dark: Color(hex: "#FF5A5A")
    )
    public let errorText = Color(
        light: Color(hex: "#A73535"),
        dark: Color(hex: "#FF8A8A")
    )
    public let grayDark = Color(
        light: Color(hex: "#CDD4DA"),
        dark: Color(hex: "#3A444D")
    )
    public let linkText = Color(
        light: Color(hex: "#3F7BA6"),
        dark: Color(hex: "#73B8E8")
    )
    public let success = Color(
        light: Color(hex: "#00D066"),
        dark: Color(hex: "#22E07B")
    )
    public let successText = Color(
        light: Color(hex: "#006B34"),
        dark: Color(hex: "#7DFFB3")
    )
    public let text = Color(
        light: Color(hex: "#0D0E10"),
        dark: Color(hex: "#EBF2F4")
    )
    public let secondaryText = Color.gray
    public let textBackground = Color(
        light: .white,
        dark: Color(hex: "444444"),
    )
    public let grayBackground = Color(
        light: Color(hex: "#E2E2E2"),
        dark: Color(hex: "#2F2F2F")
    )
    public let warning = Color(
        light: Color(hex: "#F7BF0B"),
        dark: Color(hex: "#FFD54A")
    )
    public let warningText = Color.orange
    public let shadow = Color(hex: "#10274226")
    
    public let nerdView = NerdViewScheme()
}

extension Color {
    
    public static let scheme = ColorScheme()
}

#Preview {
    
    Grid {
        GridRow {
            Rectangle()
                .foregroundStyle(Color.scheme.accent)
            Rectangle()
                .foregroundStyle(Color.scheme.accentText)
            Rectangle()
                .foregroundStyle(Color.scheme.background)
            Rectangle()
                .foregroundStyle(Color.scheme.backgroundScroll)
        }
        GridRow {
            Rectangle()
                .foregroundStyle(Color.scheme.codeAccent)
            Rectangle()
                .foregroundStyle(Color.scheme.credentialHeaderBackground)
            Rectangle()
                .foregroundStyle(Color.scheme.error)
            Rectangle()
                .foregroundStyle(Color.scheme.errorText)
        }
        GridRow {
            Rectangle()
                .foregroundStyle(Color.scheme.grayDark)
            Rectangle()
                .foregroundStyle(Color.scheme.linkText)
            Rectangle()
                .foregroundStyle(Color.scheme.success)
            Rectangle()
                .foregroundStyle(Color.scheme.successText)
        }
        GridRow {
            Rectangle()
                .foregroundStyle(Color.scheme.text)
            Rectangle()
                .foregroundStyle(Color.scheme.textBackground)
            Rectangle()
                .foregroundStyle(Color.scheme.warning)
            Rectangle()
                .foregroundStyle(Color.scheme.grayBackground)
        }
        GridRow {
            Rectangle()
                .foregroundStyle(Color.scheme.secondaryText)
        }
    }
    .shadow(color: Color.scheme.shadow, radius: 7, x: 0, y: 5)
    .padding(8)
    .background(Color.scheme.background)
}
