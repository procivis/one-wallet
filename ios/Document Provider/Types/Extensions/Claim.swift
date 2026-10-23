import ProcivisOneCore
import SwiftUI

protocol CredentialAttributeViewModelProviding {
    
    var path: String { get }
    var schema: ClaimSchemaInfo { get }
    var parseableValue: ParseableClaimValue { get }
    
    var selected: Bool { get }
    var disabled: Bool { get }
    
    func attributeViewModel(language: String, arrayElement: Bool) -> CredentialDetailCardView.Attribute
}

extension CredentialAttributeViewModelProviding {
    
    var selected: Bool { false }
    var disabled: Bool { false }
    
    func attributeViewModel(language: String, arrayElement: Bool = false) -> CredentialDetailCardView.Attribute {
        var name: String? = self.schema.translations.name[language] ?? self.schema.translations.name["en"] ?? self.schema.key
        if arrayElement == true {
            name = nil
        }
        var value: CredentialDetailCardView.AttributeValue = .text(parseableValue.readableValue ?? schema.datatype)
        if let children = parseableValue.children {
            value = .children(children.map { $0.attributeViewModel(language: language, arrayElement: schema.array) })
        } else if schema.datatype == "PICTURE" || schema.datatype == "MDL_PICTURE" || schema.datatype == "SWIYU_PICTURE",
                  let imageString = parseableValue.readableValue,
                  let image = UIImage(base64Encoded: imageString) {
            value = .image(image)
        }
        return .init(
            name: name,
            value: value,
            path: path,
            selected: selected,
            disabled: disabled,
        )
    }
}

extension Claim: CredentialAttributeViewModelProviding {
    
    var parseableValue: any ParseableClaimValue {
        return self.value
    }
}

extension PresentationDefinitionV2Claim: CredentialAttributeViewModelProviding {
    
    var parseableValue: any ParseableClaimValue {
        return self.value
    }
    
    var selected: Bool { required }
    
    var disabled: Bool { !userSelection }
}
