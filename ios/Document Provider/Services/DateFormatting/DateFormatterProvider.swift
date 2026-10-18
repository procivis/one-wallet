import SwiftUI

struct DateFormatterProvider {
    
    var isoDateFormatter: DateFormatter {
        let dateFormatter = baseDateFormatter
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        return dateFormatter
    }
    
    var dateFormatter: DateFormatter {
        let dateFormatter = baseDateFormatter
        dateFormatter.setLocalizedDateFormatFromTemplate("dd.MM.yyyy, HH:mm")
        return dateFormatter
    }
    
    private var baseDateFormatter: DateFormatter {
        let dateFormatter = DateFormatter()
//        if IS_TESTING {
//            dateFormatter.locale = Locale(identifier: "en_CH")
//            dateFormatter.timeZone = TimeZone(identifier: "Europe/Zurich")
//        }
        return dateFormatter
    }
}
