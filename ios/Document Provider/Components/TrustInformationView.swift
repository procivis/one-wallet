import SwiftUI

struct TrustInformationView: View {
    
    enum Status {
        case trusted
        case untrusted
        case unknown
        
        var text: LocalizedStringKey {
            switch self {
            case .trusted:
                return "Trusted"
            case .untrusted:
                return "Untrusted"
            case .unknown:
                return "Unknown"
            }
        }
        
        var color: Color {
            switch self {
            case .trusted:
                return .scheme.successText
            case .untrusted:
                return .scheme.errorText
            case .unknown:
                return .gray
            }
        }
    }
    
    enum EntityType {
        case issuer
        case verifier
        
        var text: LocalizedStringKey {
            switch self {
            case .issuer:
                return "issuer"
            case .verifier:
                return "verifier"
            }
        }
    }
    
    struct ViewModel {
        
        let name: String?
        let status: Status
    }
    
    let viewModel: ViewModel
    let entityType: EntityType
    
    var body: some View {
        HStack(alignment: .center) {
            ZStack() {
                Rectangle()
                    .foregroundStyle(Color.scheme.textBackground)
                Text(viewModel.name?.first?.uppercased() ?? "U")
                    .font(Font.system(.headline).bold())
                    .foregroundStyle(Color.scheme.text)
                    .padding(4)
            }
            .cornerRadius(40)
            .padding(12)
            .frame(width: 80, height: 80)
            VStack(alignment: .leading, spacing: 6) {
                if let name = viewModel.name {
                    Text(name)
                        .foregroundStyle(Color.scheme.text)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                Text(String("\(viewModel.status.text.localizedStringValue) \(entityType.text.localizedStringValue)"))
                    .foregroundStyle(viewModel.status.color)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .padding(.trailing, 8)
            Spacer()
        }
        .background(Color.scheme.grayBackground)
        .cornerRadius(12)
    }
}

#Preview {
    VStack {
        TrustInformationView(viewModel: TrustInformationView.ViewModel(name: "Test issuer", status: .trusted), entityType: .issuer)
        TrustInformationView(viewModel: TrustInformationView.ViewModel(name: "Test issuer", status: .untrusted), entityType: .issuer)
        TrustInformationView(viewModel: TrustInformationView.ViewModel(name: "Test issuer", status: .unknown), entityType: .verifier)
        TrustInformationView(viewModel: TrustInformationView.ViewModel(name: nil, status: .unknown), entityType: .verifier)
        TrustInformationView(viewModel: TrustInformationView.ViewModel(name: "Test issuer", status: .untrusted), entityType: .issuer)
            .padding(.horizontal, 90)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 32)
    .background(Color.scheme.background)
}
