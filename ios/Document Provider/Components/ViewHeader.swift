import SwiftUI

struct ViewHeader: View {
    
    let title: LocalizedStringKey?
    let subtitle: LocalizedStringKey?
    
    init(title: LocalizedStringKey? = nil, subtitle: LocalizedStringKey? = nil) {
        self.title = title
        self.subtitle = subtitle
    }
    
    var body: some View {
        VStack(spacing: 24) {
            if let title {
                Text(title)
                    .fontWeight(.heavy)
                    .padding(.horizontal)
            }
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
        }
        .padding(.top)
        .padding(.horizontal, 32)
    }
}

#Preview {
    ViewHeader(title: "Test", subtitle: "Subtitle test")
}
