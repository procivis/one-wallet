import SwiftUI

extension UIImage {
    
    public convenience init?(base64Encoded base64: String) {
        guard base64.hasPrefix("data:image/png;base64,") || base64.hasPrefix("data:image/jpeg;base64,"),
              let imageBase64 = base64.split(separator: ",").last,
              let imageData = Data(base64Encoded: String(imageBase64)) else {
            return nil
        }
        self.init(data: imageData)
    }
}
