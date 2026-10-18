import ExtensionKit
import IdentityDocumentServicesUI
import SwiftUI

@main
struct DocumentProviderExtension: IdentityDocumentProvider {
    
    @State var moduleLog: String?
    
    var body: some IdentityDocumentRequestScene {
        ISO18013MobileDocumentRequestScene { context in
            DocumentProviderView(context: context)
        }
    }
    
    func performRegistrationUpdates() async {
        
    }    
}
