import SwiftUI

struct CredentialHeaderView: View {
    
    enum Logo {
        case imageURL(url: URL)
        case uiImage(image: UIImage)
        case initials(fontColor: Color, backgroundColor: Color)
        case none
        
        static var `default`: Self {
            .initials(
                fontColor: .white,
                backgroundColor: .init(hex: "#5A69F3")
            )
        }
    }
    
    struct ViewModel {
        
        let logo: Logo
        let name: String
        let primary: String?
        let primaryColor: Color?
        let secondary: String?
        let secondaryColor: Color?
        
        init(
            logo: Logo,
            name: String,
            primary: String? = nil,
            primaryColor: Color? = .scheme.text,
            secondary: String? = nil,
            secondaryColor: Color? = .scheme.text
        ) {
            self.logo = logo
            self.name = name
            self.primary = primary
            self.primaryColor = primaryColor
            self.secondary = secondary
            self.secondaryColor = secondaryColor
        }
    }
    
    let viewModel: ViewModel
    
    var body: some View {
        HStack(alignment: .center, spacing: 8) {
            switch viewModel.logo {
            case .imageURL(let url):
                AsyncImage(url: url)
                    .cornerRadius(8)
                    .padding(4)
                    .frame(width: 60, height: 60)
            case .uiImage(let image):
                Image(uiImage: image)
                    .resizable()
                    .cornerRadius(8)
                    .padding(4)
                    .frame(width: 60, height: 60)
            case .initials(let fontColor, let backgroundColor):
                ZStack() {
                    Rectangle()
                        .foregroundStyle(backgroundColor)
                    Text(viewModel.name.first?.uppercased() ?? "?")
                        .font(Font.system(.headline).bold())
                        .foregroundStyle(fontColor)
                        .padding(4)
                }
                .cornerRadius(8)
                .padding(4)
                .frame(width: 60, height: 60)
            case .none:
                EmptyView()
            }
            VStack(alignment: .leading, spacing: 6) {
                Text(viewModel.name)
                    .foregroundStyle(Color.scheme.text)
                HStack() {
                    if let primary = viewModel.primary {
                        Text(primary)
                            .foregroundStyle(viewModel.primaryColor ?? .scheme.text)
                    }
                    if viewModel.primary != nil && viewModel.secondary != nil {
                        Divider()
                    }
                    if let secondary = viewModel.secondary {
                        Text(secondary)
                            .foregroundStyle(viewModel.secondaryColor ?? .scheme.text)
                    }
                }
            }
            .padding(.trailing, 8)
            .padding(.vertical, 8)
            Spacer()
        }
        .background(.ultraThinMaterial)
        .frame(height: 60)
    }
}

#Preview {
    CredentialHeaderView(
        viewModel: CredentialHeaderView.ViewModel(
            logo: .initials(fontColor: .black, backgroundColor: .gray),
            name: "Name",
            primary: "Primary",
            secondary: "Secondary"
        )
    )
    
    CredentialHeaderView(
        viewModel: CredentialHeaderView.ViewModel(
            logo: .initials(fontColor: .black, backgroundColor: .gray),
            name: "Name",
            primary: "Primary",
        )
    )
    
    CredentialHeaderView(
        viewModel: CredentialHeaderView.ViewModel(
            logo: .initials(fontColor: .black, backgroundColor: .gray),
            name: "Name",
        )
    )
    
    // swiftlint:disable:next line_length
    let imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAE8klEQVR4nOza+1NUZRgHcNY5QTBEo4HDJV0SBbmssFIJQYFc1hUxNAUDMbwGBQxK4AChs+2QojBRDKLSYBDJEKDWatxHWiIRwZHbChgSwwgorbsJLLOA7PZT3+dPOHNmzvPT5905yj7zvO+77+Uwx5KEJv+HtCYMLho2hyOOfQ0HFozRM6l+sPe5InjUsgQuXV4J90eXwW5m6+BoSQecOSiDI9vt4F3yJVid/Te8woTjwSfAdjBqXTcaiaMjsIWpA6zPPwNn1pvB3cU34GpX6qOirouwuWgzrEpNgW0SfoDFaaFwb40Y3h0eDSdPGOHJOVOY8xXgE2A7BAt9ejSa3N+Dvfouw/HmcbBCcwo+o7wJi10/gocm6POM9Am49jH9biSNusNWlh/ALfoa2OfIAdjx8iS8ubAR5nwF+ATYDsapNxGNatUA7O/9MXx6ivr9pol5OK+L5n7581dgmUs/HBXSBtdZLNPz+/Nhn0pa24jjhuGBtefgmI4xuDJPDXO+AnwCbIdg/PqvaDQqNsKTK2gd0iOjtYfwSR7947cPwk1FtAfw2/AFfLNgFp5pfQJ729IY27ZIe4ku92/gkvRY+g57NXCOew7M+QrwCbAdTOwv19FQ9NrCRi2NjcRp6t/DVh/CBQO0T0jP9oS1GSdh1+ZW2LBI83qu4Cq8+tp5OEIbAs+sL4Rr3aRwW4UTzPkK8AmwHYLl8N/QkPrTWkimeghbpdJ+oOPU+7B+H42ZNeUv4AqpPWz7kvruyoI5uMHuHizvvAAPqVfBq/U0Tqp003CWRgdzvgJ8AmyHQLKJ1ipt9bTWX1rVBUdIhmDPL4vh2dBH8IV9SthxozPsVpYNT+l2wM9662GXZ7Q38L1P+2bFJfpuJv/2gAkiWmtxvgJ8AmyHwNOyDI2lz2mOd9DQfGxyfAw8IWuAFUIaA8U3jsPhf7XA3wvr4EAbFVzQ+A7MDNLZVK31fbjaeit8y4buE8ZbGJjzFeATYDuYYvljNKprK+GgFBGcJ5TD2Tk0T+dKqB+7vuoG3zlJaxtTH7pPcD5Kaxut2U+w08s1cP9ab/pb12jvUaq+BBf5JsCcrwCfANvBZD2lPevc3Xfh84Nvwh6ddC7UskRn//Kwb+lzKfVRxdxzWNVM9wMb0v6B7RNo/KwrfQDnZCXB3lW5sNJId3bCPXT2yvkK8AmwHczsVdq/7jJLhr0a6H5qaut3cP74erjJ5Q/YkE7nm6J2mtd39NEZ6xUt3QOEtO6EHx4KhmMKt8PxwfRbMXKkCp7X7Ic5XwE+AbZDMNNKa+vpwh/h0/O0H5gy0DN2T+m8qPTwFlj0IAPOD6A+Gnc0CI761APevUB7his1FvCeHtpj+E3SOq25ohpmdsbAnK8AnwDbwTjejkfjteZt8B3pz/DiWXrmbCrtGW4lUx+1P+QFz6QFwu3GBbgp7CB84DCNN3/ln/AnUZGwWPgZLNlC72LcE78Bc74CfAJsByPJ8EfDuZzm+Ap6dcgk33gXfj3UEg5oobPLAAPN34EX6ffBN5judJXKcDhnlubyog66G27opvVVu5ruBCwtDLDekA5zvgJ8AmwHI7ytReMtVzq3yZTTuwklQeXw7ym0J/YYoTVS4jTdDT96Qe9adzjQ+0K67bVweawMjtTQfB+no3Mk684TcF3rXtjnK/r/OV8BPgG2478AAAD//9TbjzL1FQmzAAAAAElFTkSuQmCC"
    
    if let imageData = Data(base64Encoded: imageBase64),
       let image = UIImage(data: imageData) {
        CredentialHeaderView(
            viewModel: CredentialHeaderView.ViewModel(
                logo: .uiImage(image: image),
                name: "Name",
                primary: "Primary",
                secondary: "Secondary"
            )
        )
    }
}
