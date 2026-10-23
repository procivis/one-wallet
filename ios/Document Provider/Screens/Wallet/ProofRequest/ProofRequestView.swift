import SwiftUI
import ProcivisOneCore

struct ProofRequestView: View {
    
    let proofRequest: ProofRequest
    let onDismiss: (() -> Void)?
    
    @EnvironmentObject var oneCore: OneCore
    @Environment(\.openURL)
    private var openURL
    
    @State private var presentationDefinition: PresentationDefinition?
    @State private var proofDetail: ProofDetail?
    @Binding var selection: ProofRequestSelection
    @State private var submissionStatus: Status? = nil
    @State private var canSubmit = false
    
    var primaryButton: ButtonProps? {
        if submissionStatus == .success && proofDetail?.redirectUri != nil {
            return ButtonProps(action: { dismiss(redirect: true) }, label: "Back to service")
        }
        switch submissionStatus {
        case .success, .failure, .error:
            return ButtonProps(action: { dismiss() }, label: "Close")
        default:
            return nil
        }
    }
    
    var secondaryButton: ButtonProps? {
        if submissionStatus == .success && proofDetail?.redirectUri != nil {
            return ButtonProps(action: { dismiss() }, label: "Close")
        }
        return nil
    }
    
    var body: some View {
        if let submissionStatus {
            LoadingResultView(status: submissionStatus, primaryButton: primaryButton, secondaryButton: secondaryButton)
                .navigationTitle("Share credential")
        } else if let presentationDefinition {
            ScrollView {
                PresentationDefinitionView(presentationDefinition: presentationDefinition, selection: $selection)
                    .padding(.horizontal)
                    .padding(.bottom, 90)
            }
            .background(Color.scheme.background)
            .overlay(alignment: .bottom) {
                Button(action: submitProof) {
                    Text("Share")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PrimaryButton())
                .disabled(!canSubmit)
                .padding([.bottom, .horizontal])
            }
            .navigationTitle("Share credential")
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: rejectProof) {
                        Image(systemName: "multiply")
                    }
                }
            }
            .onChange(of: selection) {
                guard let presentationDefinition = _presentationDefinition.wrappedValue,
                      presentationDefinition.valid else {
                    return
                }
                self.canSubmit = selection.canSubmit(
                    credentialSets: presentationDefinition.credentialSets,
                    credentialQueries: presentationDefinition.credentialQueries
                )
            }
        } else {
            ProgressView()
                .scaleEffect(3)
                .background(Color.scheme.background)
                .navigationTitle("Share credential")
                .onAppear() {
                    getPresentationDefinition()
                }
        }
    }
    
    private func getPresentationDefinition() {
        Task {
            guard let presentationDefinition = try? await oneCore.getPresentationDefinition(proofId: proofRequest.proofId),
                  let proofDetail = try? await oneCore.getProof(proofId: proofRequest.proofId) else {
                return
            }
            debugPrint(proofDetail)
            let parsedPresentationDefinition = presentationDefinition.parsedPresentationDefinition
            self.presentationDefinition = parsedPresentationDefinition
            self.proofDetail = proofDetail
            self.canSubmit = parsedPresentationDefinition.valid && selection.canSubmit(
                credentialSets: parsedPresentationDefinition.credentialSets,
                credentialQueries: parsedPresentationDefinition.credentialQueries
            )
        }
    }
    
    private func dismiss(redirect: Bool = false) {
        if redirect, let redirectUri = proofDetail?.redirectUri, let url = URL(string: redirectUri) {
            openURL(url)
        }
        onDismiss?()
    }
    
    private func submitProof() {
        Task {
            guard let credentialSets = presentationDefinition?.credentialSets else {
                return
            }
            let submission = selection.submission(credentialSets: credentialSets)
            submissionStatus = .inProgress
            do {
                try await oneCore.submitProof(interactionId: proofRequest.interactionId, submission: submission)
                submissionStatus = .success
            } catch {
                submissionStatus = .error
            }
        }
    }
    
    private func rejectProof() {
        Task {
            try? await oneCore.rejectProof(interactionId: proofRequest.interactionId)
            dismiss()
        }
    }
}
