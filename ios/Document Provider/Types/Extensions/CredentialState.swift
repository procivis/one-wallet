import SwiftUI
import ProcivisOneCore

extension CredentialState {
    
    var readableValue: String {
        switch self {
        case .created:
            return "Created"
        case .pending:
            return "Pending"
        case .offered:
            return "Offered"
        case .accepted:
            return "Accepted"
        case .rejected:
            return "Rejected"
        case .revoked:
            return "Revoked"
        case .suspended:
            return "Suspended"
        case .interactionExpired:
            return "Interaction Expired"
        default:
            return "Unknown"
        }
    }
    
    var credentialListStatus: String? {
        guard self == .suspended || self == .revoked else { return nil }
        return readableValue
    }
    
    var credentialListStatusColor: Color? {
        if self == .suspended {
            return .scheme.warningText
        } else if self == .revoked {
            return .scheme.errorText
        }
        return nil
    }
}
