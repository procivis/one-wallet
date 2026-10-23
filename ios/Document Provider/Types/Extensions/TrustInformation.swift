import SwiftUI
import ProcivisOneCore

extension TrustInformation {
    
    var trustInformationViewModel: TrustInformationView.ViewModel {
        let status: TrustInformationView.Status
        switch self.result {
        case .trusted:
            status = .trusted
        case .untrusted:
            status = .untrusted
        case .unknown:
            status = .unknown
        default:
            status = .unknown
        }
        return TrustInformationView.ViewModel(
            name: self.name,
            status: status
        )
    }
}
