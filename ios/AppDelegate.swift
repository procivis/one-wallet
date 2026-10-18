import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash

@main
class AppDelegate: UIResponder, UIApplicationDelegate, RNAppAuthAuthorizationFlowManager {
    
    weak var window: UIWindow?
    
    public weak var authorizationFlowManagerDelegate:
    RNAppAuthAuthorizationFlowManagerDelegate?
    
    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let config = UISceneConfiguration(
            name: "Default Configuration",
            sessionRole: connectingSceneSession.role
        )
        config.delegateClass = SceneDelegate.self
        return config
    }
    
    @discardableResult
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        if let authorizationFlowManagerDelegate,
           authorizationFlowManagerDelegate.resumeExternalUserAgentFlow(with: url) {
            return true
        }
        return RCTLinkingManager.application(app, open: url, options: options)
    }
    
    @discardableResult
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([any UIUserActivityRestoring]?) -> Void) -> Bool {
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let authorizationFlowManagerDelegate,
           authorizationFlowManagerDelegate.resumeExternalUserAgentFlow(with: userActivity.webpageURL) {
            return true
        }
        return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        self.bundleURL()
    }
    
    override func bundleURL() -> URL? {
#if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
    }
    
    override func customize(_ rootView: RCTRootView) {
        super.customize(rootView)
        RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView) // ⬅️ initialize the splash screen
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    
    var window: UIWindow?
    
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?
    
    private var appDelegate: AppDelegate? {
        UIApplication.shared.delegate as? AppDelegate
    }
    
    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }
        guard let appDelegate else { return };
        
        moveCoreDBToApplicationGroup()
        
        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()
        
        reactNativeDelegate = delegate
        reactNativeFactory = factory
        
        window = UIWindow(windowScene: windowScene)
        
        factory.startReactNative(
            withModuleName: "Wallet",
            in: window,
            launchOptions: [:] // TODO: update to connectionOptions:(UISceneConnectionOptions *_Nullable)connectionOptions with react-native 0.88.0 release
        )
        appDelegate.window = window;
        
        window?.makeKeyAndVisible()
        
        // Cold start from a link.
        self.scene(scene, openURLContexts: connectionOptions.urlContexts)
        for activity in connectionOptions.userActivities {
            self.scene(scene, continue: activity)
        }
    }
    
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let appDelegate else { return };
        URLContexts.forEach { urlContext in
            appDelegate.application(.shared, open: urlContext.url)
        }
    }
    
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard let appDelegate else { return };
        appDelegate.application(.shared, continue: userActivity) { _ in }
    }
    
    private func moveCoreDBToApplicationGroup() {
        let appId = APP_ID as String
        guard let sharedContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.\(appId)"),
              let appContainer = NSSearchPathForDirectoriesInDomains(
                .applicationSupportDirectory,
                .userDomainMask,
                true
              ).first,
              let appContainerURL = URL(string: appContainer),
              let contents = try? FileManager.default.contentsOfDirectory(at: appContainerURL, includingPropertiesForKeys: nil),
              let dbFileUrl = contents.first(where: { url in
                  url.lastPathComponent == "one_core_db.sqlite"
              }) else {
            return
        }
        let appSupportURL = sharedContainerURL.appendingPathComponent("Library", isDirectory: true).appendingPathComponent("Application Support", isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: appSupportURL, withIntermediateDirectories: true, attributes: nil)
        } catch {
            print("Failed to create Application Support directory: \(error)")
        }
        do {
            try FileManager.default.moveItem(at: dbFileUrl, to: appSupportURL.appendingPathComponent("one_core_db.sqlite"))
        } catch {
            print("Failed to move Core database: \(error)")
        }
    }
}
