import ProcivisOneCore

protocol ParseableClaimValue {
    
    var readableValue: String? { get }
    var children: [CredentialAttributeViewModelProviding]? { get }
}

extension ClaimValue: ParseableClaimValue {
    
    var readableValue: String? {
        switch self {
        case .boolean(let value):
            return value ? "true" : "false"
        case .string(let value):
            return value
        case .integer(let value):
            return "\(value)"
        case .float(let value):
            return "\(value)"
        case .nested(_):
            return nil
        default:
            return nil
        }
    }
    
    var children: [any CredentialAttributeViewModelProviding]? {
        if case .nested(let value) = self {
            return value
        }
        return nil
    }
}

extension PresentationDefinitionV2ClaimValue: ParseableClaimValue {
    
    var readableValue: String? {
        switch self {
        case .boolean(let value):
            return value ? "true" : "false"
        case .string(let value):
            return value
        case .integer(let value):
            return "\(value)"
        case .float(let value):
            return "\(value)"
        case .nested(_):
            return nil
        default:
            return nil
        }
    }
    
    var children: [any CredentialAttributeViewModelProviding]? {
        if case .nested(let value) = self {
            return value
        }
        return nil
    }
}
