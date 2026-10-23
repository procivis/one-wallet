import SwiftUI

struct LoadingResultView: View {
    
    let title: LocalizedStringKey?
    let subtitle: LocalizedStringKey?
    let errorMessage: LocalizedStringKey?
    let status: Status
    let primaryButton: ButtonProps?
    let secondaryButton: ButtonProps?
    
    init(
        title: LocalizedStringKey? = nil,
        subtitle: LocalizedStringKey? = nil,
        errorMessage: LocalizedStringKey? = nil,
        status: Status = .inProgress,
        primaryButton: ButtonProps? = nil,
        secondaryButton: ButtonProps? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.errorMessage = errorMessage
        self.status = status
        self.primaryButton = primaryButton
        self.secondaryButton = secondaryButton
    }
    
    var body: some View {
        VStack(spacing: 48) {
            if title != nil || subtitle != nil {
                ViewHeader(title: title, subtitle: subtitle)
            }
            Spacer()
            switch status {
            case .inProgress:
                ProgressView().scaleEffect(3)
                    .transition(.opacity)
            case .success:
                Image(systemName: "checkmark.circle")
                    .foregroundStyle(Color.scheme.success)
                    .scaleEffect(4)
                    .transition(.opacity)
            case .failure:
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(Color.scheme.warning)
                    .scaleEffect(4)
                    .transition(.opacity)
                if let errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(Color.scheme.text)
                        .padding(.horizontal)
                        .multilineTextAlignment(.center)
                }
            case .error:
                Image(systemName: "multiply.circle.fill")
                    .foregroundStyle(Color.scheme.error)
                    .scaleEffect(4)
                    .transition(.opacity)
                if let errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(Color.scheme.error)
                        .padding(.horizontal)
                        .multilineTextAlignment(.center)
                }
            }
            Spacer()
            if primaryButton != nil || secondaryButton != nil {
                VStack {
                    if let primaryButton {
                        Button(action: primaryButton.action) {
                            Text(primaryButton.label)
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(PrimaryButton())
                        .padding([.bottom, .horizontal])
                    }
                    if let secondaryButton {
                        Button(action: secondaryButton.action) {
                            Text(secondaryButton.label)
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(SecondaryButton())
                        .padding([.bottom, .horizontal])
                    }
                }
            }
        }
        .frame(maxWidth: .infinity)
        .background(Color.scheme.background)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            LoadingResultView(
                title: "Title",
                subtitle: "Subtitle subtitle subtitle subtitle subtitle subtitle subtitle",
                status: .inProgress,
                primaryButton: ButtonProps(
                    action: {
                    },
                    label: "Primary button"
                ),
                secondaryButton: ButtonProps(
                    action: {
                    },
                    label: "Secondary button"
                ),
            )
            LoadingResultView(
                title: "Title",
                subtitle: "Subtitle subtitle subtitle subtitle subtitle subtitle subtitle",
                status: .success,
                primaryButton: ButtonProps(
                    action: {
                    },
                    label: "Primary button"
                ),
                secondaryButton: ButtonProps(
                    action: {
                    },
                    label: "Secondary button"
                ),
            )
            LoadingResultView(
                title: "Title",
                subtitle: "Subtitle subtitle subtitle subtitle subtitle subtitle subtitle",
                errorMessage: "This is a warning",
                status: .failure,
                primaryButton: ButtonProps(
                    action: {
                    },
                    label: "Primary button"
                ),
                secondaryButton: ButtonProps(
                    action: {
                    },
                    label: "Secondary button"
                ),
            )
            LoadingResultView(
                title: "Title",
                subtitle: "Subtitle subtitle subtitle subtitle subtitle subtitle subtitle",
                errorMessage: "This is an error",
                status: .error,
                primaryButton: ButtonProps(
                    action: {
                    },
                    label: "Primary button"
                ),
                secondaryButton: ButtonProps(
                    action: {
                    },
                    label: "Secondary button"
                ),
            )
            LoadingResultView()
            LoadingResultView(status: .success)
            LoadingResultView(status: .failure)
            LoadingResultView(status: .error)
        }
    }
}
