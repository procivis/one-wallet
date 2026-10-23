import SwiftUI
import ProcivisOneCore

struct CredentialDetailCardView: View {
    
    enum AttributeValue: Equatable {
        case text(String)
        case image(UIImage)
        case children([Attribute])
    }
    
    struct Attribute: Identifiable, Equatable {
        
        let id = UUID()
        let name: String?
        let value: AttributeValue
        let path: String
        let selected: Bool
        let disabled: Bool
        
        init(name: String? = nil, value: AttributeValue, path: String, selected: Bool = false, disabled: Bool = false) {
            self.name = name
            self.value = value
            self.path = path
            self.selected = selected
            self.disabled = disabled
        }
    }
    
    struct ViewModel {
    
        let card: CredentialCardView.ViewModel
        let attributes: [Attribute]
    }
    
    let viewModel: ViewModel
    let selection: Binding<[String]>?
    let expanded: Bool
    let rounded: Bool
    
    init(viewModel: ViewModel, selection: Binding<[String]>? = nil, expanded: Bool = true, rounded: Bool = true) {
        self.viewModel = viewModel
        self.selection = selection
        self.expanded = expanded
        self.rounded = rounded
    }
    
    var body: some View {
        VStack(spacing: 0) {
            CredentialCardView(viewModel: viewModel.card)
            if (expanded) {
                Grid(alignment: .leading, verticalSpacing: 0) {
                    ForEach(viewModel.attributes) { attribute in
                        CredentialAttributeView(
                            attribute: attribute,
                            last: attribute == viewModel.attributes.last,
                            selection: selection
                        )
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .padding(.bottom, 20)
                .background(Color.scheme.textBackground)
                .transition(.opacity)
            }
        }
        .background(Color.scheme.textBackground)
        .cornerRadius(rounded ? 12 : 0)
    }
}

#Preview {
    @Previewable @State var selection: [String] = []
    
    let header = CredentialHeaderView.ViewModel(
        logo: .initials(fontColor: .black, backgroundColor: .gray),
        name: "Name",
        primary: "Primary",
        secondary: "Secondary"
    )
    
    // swiftlint:disable:next line_length
    let imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAE8klEQVR4nOza+1NUZRgHcNY5QTBEo4HDJV0SBbmssFIJQYFc1hUxNAUDMbwGBQxK4AChs+2QojBRDKLSYBDJEKDWatxHWiIRwZHbChgSwwgorbsJLLOA7PZT3+dPOHNmzvPT5905yj7zvO+77+Uwx5KEJv+HtCYMLho2hyOOfQ0HFozRM6l+sPe5InjUsgQuXV4J90eXwW5m6+BoSQecOSiDI9vt4F3yJVid/Te8woTjwSfAdjBqXTcaiaMjsIWpA6zPPwNn1pvB3cU34GpX6qOirouwuWgzrEpNgW0SfoDFaaFwb40Y3h0eDSdPGOHJOVOY8xXgE2A7BAt9ejSa3N+Dvfouw/HmcbBCcwo+o7wJi10/gocm6POM9Am49jH9biSNusNWlh/ALfoa2OfIAdjx8iS8ubAR5nwF+ATYDsapNxGNatUA7O/9MXx6ivr9pol5OK+L5n7581dgmUs/HBXSBtdZLNPz+/Nhn0pa24jjhuGBtefgmI4xuDJPDXO+AnwCbIdg/PqvaDQqNsKTK2gd0iOjtYfwSR7947cPwk1FtAfw2/AFfLNgFp5pfQJ729IY27ZIe4ku92/gkvRY+g57NXCOew7M+QrwCbAdTOwv19FQ9NrCRi2NjcRp6t/DVh/CBQO0T0jP9oS1GSdh1+ZW2LBI83qu4Cq8+tp5OEIbAs+sL4Rr3aRwW4UTzPkK8AmwHYLl8N/QkPrTWkimeghbpdJ+oOPU+7B+H42ZNeUv4AqpPWz7kvruyoI5uMHuHizvvAAPqVfBq/U0Tqp003CWRgdzvgJ8AmyHQLKJ1ipt9bTWX1rVBUdIhmDPL4vh2dBH8IV9SthxozPsVpYNT+l2wM9662GXZ7Q38L1P+2bFJfpuJv/2gAkiWmtxvgJ8AmyHwNOyDI2lz2mOd9DQfGxyfAw8IWuAFUIaA8U3jsPhf7XA3wvr4EAbFVzQ+A7MDNLZVK31fbjaeit8y4buE8ZbGJjzFeATYDuYYvljNKprK+GgFBGcJ5TD2Tk0T+dKqB+7vuoG3zlJaxtTH7pPcD5Kaxut2U+w08s1cP9ab/pb12jvUaq+BBf5JsCcrwCfANvBZD2lPevc3Xfh84Nvwh6ddC7UskRn//Kwb+lzKfVRxdxzWNVM9wMb0v6B7RNo/KwrfQDnZCXB3lW5sNJId3bCPXT2yvkK8AmwHczsVdq/7jJLhr0a6H5qaut3cP74erjJ5Q/YkE7nm6J2mtd39NEZ6xUt3QOEtO6EHx4KhmMKt8PxwfRbMXKkCp7X7Ic5XwE+AbZDMNNKa+vpwh/h0/O0H5gy0DN2T+m8qPTwFlj0IAPOD6A+Gnc0CI761APevUB7his1FvCeHtpj+E3SOq25ohpmdsbAnK8AnwDbwTjejkfjteZt8B3pz/DiWXrmbCrtGW4lUx+1P+QFz6QFwu3GBbgp7CB84DCNN3/ln/AnUZGwWPgZLNlC72LcE78Bc74CfAJsByPJ8EfDuZzm+Ap6dcgk33gXfj3UEg5oobPLAAPN34EX6ffBN5judJXKcDhnlubyog66G27opvVVu5ruBCwtDLDekA5zvgJ8AmwHI7ytReMtVzq3yZTTuwklQeXw7ym0J/YYoTVS4jTdDT96Qe9adzjQ+0K67bVweawMjtTQfB+no3Mk684TcF3rXtjnK/r/OV8BPgG2478AAAD//9TbjzL1FQmzAAAAAElFTkSuQmCC"
    
    if let imageData = Data(base64Encoded: imageBase64),
       let image = UIImage(data: imageData) {
        ScrollView {
            CredentialDetailCardView(
                viewModel: CredentialDetailCardView.ViewModel(
                    card: CredentialCardView.ViewModel(
                        header: header,
                        background: .uiImage(image: image)
                    ),
                    attributes: [
                        CredentialDetailCardView.Attribute(
                            name: "given_name",
                            value: .text("John"),
                            path: "given_name",
                        ),
                        CredentialDetailCardView.Attribute(
                            name: "family_name",
                            value: .text("Doe"),
                            path: "family_name",
                        ),
                        CredentialDetailCardView.Attribute(
                            name: "address",
                            value: .children([
                                CredentialDetailCardView.Attribute(
                                    name: "address/0",
                                    value: .children([
                                        CredentialDetailCardView.Attribute(
                                            name: "street",
                                            value: .text("Street 123"),
                                            path: "address/street",
                                            disabled: true,
                                        ),
                                        CredentialDetailCardView.Attribute(
                                            name: "address/postal_code",
                                            value: .text("12-345"),
                                            path: "address/postal_code",
                                            disabled: true,
                                        ),
                                    ]),
                                    path: "address",
                                    selected: true,
                                ),
                                CredentialDetailCardView.Attribute(
                                    name: "address/1",
                                    value: .children([
                                        CredentialDetailCardView.Attribute(
                                            name: "street",
                                            value: .text("Street 123"),
                                            path: "address/street",
                                            disabled: true,
                                        ),
                                        CredentialDetailCardView.Attribute(
                                            name: "address/postal_code",
                                            value: .text("12-345"),
                                            path: "address/postal_code",
                                            disabled: true,
                                        ),
                                        CredentialDetailCardView.Attribute(
                                            name: "picture",
                                            value: .image(image),
                                            path: "picture",
                                            disabled: true,
                                        ),
                                    ]),
                                    path: "address",
                                    selected: true,
                                ),
                            ]),
                            path: "address",
                            selected: true,
                        ),
                        CredentialDetailCardView.Attribute(
                            name: "nationalities",
                            value: .children([
                                CredentialDetailCardView.Attribute(
                                    value: .text("PL"),
                                    path: "nationalities/0",
                                ),
                                CredentialDetailCardView.Attribute(
                                    value: .text("CH"),
                                    path: "nationalities/1",
                                ),
                            ]),
                            path: "nationalities",
                        ),
                    ]
                ),
                selection: $selection,
                expanded: true,
            )
            .padding()
        }
        .background(Color.scheme.background)
    }
}
