import SwiftUI

struct ButtonProps {
    
    let action: @MainActor () -> Void
    let label: String
}
