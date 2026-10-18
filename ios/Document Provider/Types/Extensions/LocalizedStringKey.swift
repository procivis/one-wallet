import SwiftUI

extension LocalizedStringKey {

    var stringKey: String? {
        Mirror(reflecting: self).children.first(where: { $0.label == "key" })?.value as? String
    }
    var staticStringKey: StaticString? {
        Mirror(reflecting: self).children.first(where: { $0.label == "key" })?.value as? StaticString
    }

    var localizedStringValue: String {
        guard let stringKey else {
            return ""
        }
        let language = Locale.current.identifier
        guard let bundlePath = Bundle.main.path(forResource: language, ofType: "lproj"),
              let bundle = Bundle(path: bundlePath) else {
            return NSLocalizedString(stringKey, comment: "")
        }
        return NSLocalizedString(stringKey, bundle: bundle, comment: "")
    }
}
