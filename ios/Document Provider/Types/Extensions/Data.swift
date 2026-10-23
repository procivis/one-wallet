extension Data {
    
    init?(base64URLEncoded base64URLString: String) {
        // 1. Replace URL-safe characters with standard Base64 characters
        var base64 = base64URLString
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        
        // 2. Add back missing padding '=' characters
        let remainder = base64.count % 4
        if remainder > 0 {
            base64.append(String(repeating: "=", count: 4 - remainder))
        }
        
        // 3. Initialize using standard Base64 decoding
        self.init(base64Encoded: base64)
    }
}
