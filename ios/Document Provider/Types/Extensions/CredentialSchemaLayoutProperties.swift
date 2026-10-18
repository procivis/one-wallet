import SwiftUI
import ProcivisOneCore

extension CredentialSchemaLayoutProperties {
    
    var credentialHeaderLogo: CredentialHeaderView.Logo {
        if let imageString = logo?.image,
           let image = UIImage(base64Encoded: imageString) {
            return .uiImage(image: image)
        } else if let imageString = logo?.image,
                  imageString.hasPrefix("http://") || imageString.hasPrefix("https://"),
                  let imageURL = URL(string: imageString) {
            return .imageURL(url: imageURL)
        } else if let fontColor = logo?.fontColor, let backgroundColor = logo?.backgroundColor {
            return .initials(
                fontColor: .init(hex: fontColor),
                backgroundColor: .init(hex: backgroundColor)
            )
        }
        return .default
    }
    
    var credentialCardBackground: CredentialCardView.Background {
        if let imageString = background?.image,
           let image = UIImage(base64Encoded: imageString) {
            return .uiImage(image: image)
        } else if let imageString = background?.image,
                  imageString.hasPrefix("http://") || imageString.hasPrefix("https://"),
                  let imageURL = URL(string: imageString) {
            return .imageURL(url: imageURL)
        } else if let backgroundColor = background?.color {
            return .color(backgroundColor: .init(hex: backgroundColor))
        }
        return .default
    }
}
