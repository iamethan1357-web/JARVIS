"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAppUrl(window.location.origin);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") { setIsInstalled(true); setInstallPrompt(null); }
  };

  const copyUrl = () => {
    if (appUrl) { navigator.clipboard.writeText(appUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e2e8f0] overflow-y-auto">
      {/* Header */}
      <header className="border-b border-[#1e3a5f]/50 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full border-2 border-[#00b4d8] flex items-center justify-center bg-[#00b4d8]/10">
              <span className="text-[#00b4d8] font-bold text-sm font-mono">J</span>
            </div>
            <span className="text-[#00b4d8] font-bold tracking-wider font-mono">J.A.R.V.I.S.</span>
          </a>
          <a href="/" className="text-xs text-[#94a3b8] hover:text-[#00b4d8] transition-colors">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-2 border-[#00b4d8] flex items-center justify-center mx-auto bg-[#00b4d8]/10" style={{ boxShadow: "0 0 40px rgba(0,180,216,0.2)" }}>
            <span className="text-[#00b4d8] font-bold text-2xl font-mono">J</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Install JARVIS on Your Phone</h1>
          <p className="text-[#94a3b8] max-w-lg mx-auto text-sm">
            Get JARVIS as a real app on your Android phone with its own icon, splash screen, and native experience.
          </p>
        </div>

        {/* App URL Box */}
        <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl p-4">
          <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2 font-medium">Your JARVIS App URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#0a0e17] px-4 py-3 rounded-lg text-sm text-[#00b4d8] font-mono truncate border border-[#1e3a5f]/30">
              {appUrl || "Loading..."}
            </code>
            <button
              onClick={copyUrl}
              className={`px-4 py-3 rounded-lg text-xs font-medium transition-all shrink-0 ${
                copied
                  ? "bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]"
                  : "bg-[#1a2234] border border-[#1e3a5f]/50 text-[#94a3b8] hover:text-[#00b4d8] hover:border-[#00b4d8]/30"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[10px] text-[#94a3b8]/50 mt-2">
            You&apos;ll need this URL in Step 1 below.
          </p>
        </div>

        {/* Quick install if available */}
        {installPrompt && !isInstalled && (
          <div className="bg-[#111827] border border-[#00b4d8]/30 rounded-xl p-5 text-center space-y-3" style={{ boxShadow: "0 0 30px rgba(0,180,216,0.1)" }}>
            <p className="text-sm text-[#00b4d8] font-medium">⚡ Quick Option: Your browser supports direct install</p>
            <button onClick={handleInstall} className="px-6 py-2.5 bg-[#00b4d8] text-[#0a0e17] rounded-lg text-sm font-bold hover:bg-[#48cae4] transition-colors">
              Install JARVIS as PWA
            </button>
            <p className="text-[10px] text-[#94a3b8]">This installs instantly without an APK file. For a real APK, follow the guide below.</p>
          </div>
        )}

        {isInstalled && (
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 text-center">
            <p className="text-sm text-[#10b981] font-medium">✅ JARVIS is already installed on this device as a PWA.</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* MAIN GUIDE: PWABuilder APK Generation */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Generate APK via PWABuilder — Step by Step
          </h2>
          <p className="text-sm text-[#94a3b8]">
            PWABuilder is a <strong>free tool by Microsoft</strong> that converts any PWA into a real Android APK file in minutes.
            No coding, no Android Studio, no command line. Just clicks.
          </p>
        </div>

        {/* Step 1 */}
        <StepCard step={1} title="Open PWABuilder Website" time="30 seconds">
          <p>Go to PWABuilder and enter your JARVIS app URL.</p>

          <div className="mt-3 space-y-3">
            <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e3a5f]/30">
              <p className="text-xs text-[#94a3b8] mb-2">Option A: Click this button (auto-fills your URL):</p>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 bg-[#00b4d8] text-[#0a0e17] rounded-lg text-sm font-bold hover:bg-[#48cae4] transition-colors"
              >
                🚀 Open PWABuilder with JARVIS URL →
              </a>
            </div>

            <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e3a5f]/30">
              <p className="text-xs text-[#94a3b8] mb-2">Option B: Manually go to:</p>
              <code className="text-[#48cae4] text-sm font-mono">https://www.pwabuilder.com</code>
              <p className="text-xs text-[#94a3b8] mt-2">
                Then paste your JARVIS URL into the text box on the homepage and click <strong>&ldquo;Start&rdquo;</strong>.
              </p>
            </div>
          </div>

          <Tip>
            PWABuilder will scan your app and check for a valid manifest, service worker, and HTTPS. JARVIS already has all of these configured.
          </Tip>
        </StepCard>

        {/* Step 2 */}
        <StepCard step={2} title="Wait for PWA Analysis" time="10-30 seconds">
          <p>PWABuilder will analyze your JARVIS app and show a report card with scores for:</p>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-[#0a0e17] rounded-lg p-3 text-center border border-[#1e3a5f]/20">
              <p className="text-lg font-bold text-[#10b981]">✓</p>
              <p className="text-[10px] text-[#94a3b8]">Manifest</p>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 text-center border border-[#1e3a5f]/20">
              <p className="text-lg font-bold text-[#10b981]">✓</p>
              <p className="text-[10px] text-[#94a3b8]">Service Worker</p>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 text-center border border-[#1e3a5f]/20">
              <p className="text-lg font-bold text-[#10b981]">✓</p>
              <p className="text-[10px] text-[#94a3b8]">Security (HTTPS)</p>
            </div>
          </div>

          <Tip>
            All three should show green checkmarks. If any show warnings, don&apos;t worry — you can still generate the APK.
          </Tip>
        </StepCard>

        {/* Step 3 */}
        <StepCard step={3} title='Click "Package for Stores"' time="5 seconds">
          <p>On the report card page, look for the big button that says:</p>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e3a5f]/30 mt-3 text-center">
            <div className="inline-block px-6 py-3 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg text-sm font-bold">
              📦 Package for Stores
            </div>
          </div>

          <p className="mt-3">Click it. You&apos;ll see options for different platforms.</p>
        </StepCard>

        {/* Step 4 */}
        <StepCard step={4} title="Select Android and Configure" time="1-2 minutes">
          <p>You&apos;ll see platform options. Click <strong>&ldquo;Android&rdquo;</strong> and then <strong>&ldquo;Generate Package&rdquo;</strong>.</p>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e3a5f]/30 mt-3 space-y-3">
            <p className="text-xs font-semibold text-[#00b4d8] uppercase tracking-wider">Android Configuration Options:</p>

            <div className="space-y-2">
              <ConfigItem label="Package ID" value="com.jarvis.assistant" desc="Unique app identifier (keep default or customize)" />
              <ConfigItem label="App Name" value="J.A.R.V.I.S." desc="Displayed on your phone's home screen" />
              <ConfigItem label="Launcher Name" value="JARVIS" desc="Short name shown under the app icon" />
              <ConfigItem label="App Version" value="1.0.0" desc="Leave as default for first build" />
              <ConfigItem label="App Version Code" value="1" desc="Integer version, increment for updates" />
              <ConfigItem label="Display" value="Standalone" desc="Full-screen app experience (no browser bar)" />
              <ConfigItem label="Status Bar Color" value="#0a0e17" desc="Matches JARVIS dark theme" />
              <ConfigItem label="Splash Screen Color" value="#0a0e17" desc="Dark loading screen" />
            </div>
          </div>

          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 mt-3 flex gap-2">
            <span className="shrink-0">⚠️</span>
            <div>
              <p className="text-xs text-[#f59e0b] font-medium">Signing Key</p>
              <p className="text-xs text-[#94a3b8]">
                For testing, select <strong>&ldquo;None&rdquo;</strong> or <strong>&ldquo;New&rdquo;</strong> to auto-generate a signing key.
                If you plan to publish on Google Play Store later, select <strong>&ldquo;New&rdquo;</strong> and <strong>save the keystore file</strong> — you&apos;ll need it for updates.
              </p>
            </div>
          </div>
        </StepCard>

        {/* Step 5 */}
        <StepCard step={5} title="Download Your APK" time="1-2 minutes">
          <p>Click <strong>&ldquo;Download&rdquo;</strong>. PWABuilder will compile your APK and give you a ZIP file containing:</p>

          <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e3a5f]/30 mt-3 font-mono text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#10b981]">📱</span>
              <span className="text-[#48cae4]">app-release-signed.apk</span>
              <span className="text-[#94a3b8]">← This is your APK file!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8]">📋</span>
              <span className="text-[#94a3b8]">assetlinks.json</span>
              <span className="text-[#94a3b8]/60">← For Play Store verification (optional)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8]">📋</span>
              <span className="text-[#94a3b8]">signing.keystore</span>
              <span className="text-[#94a3b8]/60">← Keep this safe for future updates</span>
            </div>
          </div>

          <Tip>
            Unzip the downloaded file. The <strong>app-release-signed.apk</strong> is what you&apos;ll install on your phone.
          </Tip>
        </StepCard>

        {/* Step 6 */}
        <StepCard step={6} title="Transfer APK to Your Phone" time="1 minute">
          <p>Get the APK file onto your Android phone using any of these methods:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <TransferMethod icon="📧" title="Email" desc="Email the APK to yourself, open on phone" />
            <TransferMethod icon="☁️" title="Google Drive" desc="Upload to Drive, download on phone" />
            <TransferMethod icon="💬" title="WhatsApp/Telegram" desc="Send APK to yourself via chat" />
            <TransferMethod icon="🔌" title="USB Cable" desc="Connect phone to PC, copy the file" />
          </div>
        </StepCard>

        {/* Step 7 */}
        <StepCard step={7} title="Install APK on Your Android Phone" time="1 minute">
          <p>Tap the APK file on your phone. If it&apos;s your first time installing from outside the Play Store, you&apos;ll need to allow it:</p>

          <div className="space-y-4 mt-4">
            <SubStep n="7a" title="Enable Unknown Sources">
              <p>When you tap the APK, Android will show a prompt:</p>
              <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#f59e0b]/30 mt-2">
                <p className="text-xs text-[#f59e0b]">&ldquo;For your security, your phone is not allowed to install unknown apps from this source&rdquo;</p>
              </div>
              <p className="mt-2">Tap <strong>&ldquo;Settings&rdquo;</strong> → Enable <strong>&ldquo;Allow from this source&rdquo;</strong> → Go back.</p>
            </SubStep>

            <SubStep n="7b" title="Install the App">
              <p>Tap <strong>&ldquo;Install&rdquo;</strong>. Wait a few seconds for installation to complete.</p>
            </SubStep>

            <SubStep n="7c" title="Open JARVIS">
              <p>Tap <strong>&ldquo;Open&rdquo;</strong> or find JARVIS on your home screen. The app will launch in full-screen mode — no browser bar, just JARVIS.</p>
            </SubStep>
          </div>

          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4 mt-4 text-center">
            <p className="text-lg font-bold text-[#10b981]">🎉 Done!</p>
            <p className="text-sm text-[#94a3b8] mt-1">JARVIS is now installed as a native app on your phone.</p>
            <p className="text-xs text-[#94a3b8]/60 mt-1">Full voice commands, notifications, and smart home control — right from your home screen.</p>
          </div>
        </StepCard>

        {/* Troubleshooting */}
        <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>🔧</span> Troubleshooting
          </h3>

          <div className="space-y-3">
            <FaqItem
              q="PWABuilder says my manifest is missing"
              a={`Make sure you're using the exact URL shown above: ${appUrl}. The manifest is at ${appUrl}/manifest.json`}
            />
            <FaqItem
              q="The APK shows a browser bar at the top"
              a="This happens when Digital Asset Links aren't verified. For personal use (sideloading), this is cosmetic — the app still works fully. To remove it, host the assetlinks.json file from the ZIP at /.well-known/assetlinks.json on your server."
            />
            <FaqItem
              q='Android says "App not installed"'
              a="Make sure you have enough storage. Also check that you don't already have the app installed with a different signing key. Uninstall the old version first."
            />
            <FaqItem
              q="Can I publish this to Google Play Store?"
              a="Yes! PWABuilder generates a store-ready signed APK. Create a Google Play Developer account ($25 one-time fee), create an app listing, upload the APK/AAB, and submit for review."
            />
            <FaqItem
              q="Will notifications work in the APK?"
              a="Yes. Push notifications work the same in the APK as in the browser, as long as notification permissions are granted."
            />
            <FaqItem
              q="Does it work without internet?"
              a="The app needs internet for live features (weather, chat, smart home). However, cached pages and the service worker provide basic offline support."
            />
          </div>
        </div>

        {/* Alternative: Bubblewrap */}
        <details className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl overflow-hidden">
          <summary className="p-5 cursor-pointer text-sm font-bold text-[#94a3b8] hover:text-[#e2e8f0] transition-colors flex items-center gap-2">
            <span>🛠️</span> Alternative: Build APK via Command Line (Bubblewrap)
          </summary>
          <div className="p-5 pt-0 space-y-3 border-t border-[#1e3a5f]/20">
            <p className="text-xs text-[#94a3b8]">For developers who prefer the terminal:</p>
            <CodeBlock code={`# 1. Install Bubblewrap\nnpm install -g @bubblewrap/cli\n\n# 2. Create project (separate folder!)\nmkdir jarvis-apk && cd jarvis-apk\n\n# 3. Initialize with your manifest URL\nbubblewrap init --manifest ${appUrl}/manifest.json\n\n# 4. Follow prompts (app name, package ID, keystore)\n# 5. Build the APK\nbubblewrap build\n\n# 6. Install on connected device\nadb install app-release-signed.apk`} />
            <p className="text-xs text-[#94a3b8]">Requires: Node.js 14+, JDK 17, Android SDK (Bubblewrap downloads SDK automatically on first run).</p>
          </div>
        </details>

        {/* Alternative: Direct PWA */}
        <details className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl overflow-hidden">
          <summary className="p-5 cursor-pointer text-sm font-bold text-[#94a3b8] hover:text-[#e2e8f0] transition-colors flex items-center gap-2">
            <span>📱</span> Alternative: Install as PWA (No APK needed)
          </summary>
          <div className="p-5 pt-0 space-y-3 border-t border-[#1e3a5f]/20">
            <p className="text-xs text-[#94a3b8]">The quickest option — no APK file needed:</p>
            <div className="space-y-2">
              <PwaStep icon="🤖" platform="Android (Chrome)" steps={["Open JARVIS in Chrome", "Tap ⋮ menu (top right)", "Tap \"Install app\" or \"Add to Home screen\"", "Tap \"Install\""]} />
              <PwaStep icon="🍎" platform="iPhone (Safari)" steps={["Open JARVIS in Safari", "Tap Share button (square with arrow)", "Scroll down, tap \"Add to Home Screen\"", "Tap \"Add\""]} />
              <PwaStep icon="💻" platform="Desktop (Chrome/Edge)" steps={["Look for install icon (⊕) in address bar", "Click \"Install\""]} />
            </div>
          </div>
        </details>

        {/* Back */}
        <div className="text-center pb-8">
          <a href="/" className="inline-block px-6 py-3 bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#00b4d8] rounded-xl text-sm hover:bg-[#00b4d8]/30 transition-colors">
            ← Return to Command Center
          </a>
        </div>
      </main>
    </div>
  );
}

/* ─── Sub-Components ──────────────────────────────────────────── */

function StepCard({ step, title, time, children }: { step: number; title: string; time: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e3a5f]/30 bg-[#1a2234]/50">
        <div className="w-9 h-9 rounded-full bg-[#00b4d8]/20 border-2 border-[#00b4d8]/50 flex items-center justify-center shrink-0">
          <span className="text-[#00b4d8] font-bold text-sm">{step}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#e2e8f0]">{title}</h3>
          <p className="text-[10px] text-[#94a3b8]">⏱ ~{time}</p>
        </div>
      </div>
      <div className="p-5 text-xs text-[#94a3b8] leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function SubStep({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#1a2234] border border-[#1e3a5f]/40 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#48cae4] text-[10px] font-bold font-mono">{n}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#e2e8f0] mb-1">{title}</p>
        <div className="text-xs text-[#94a3b8]">{children}</div>
      </div>
    </div>
  );
}

function ConfigItem({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-[#00b4d8] font-semibold w-36 shrink-0">{label}:</span>
      <span className="text-[#e2e8f0] font-mono">{value}</span>
      <span className="text-[#94a3b8]/60 hidden sm:inline">— {desc}</span>
    </div>
  );
}

function TransferMethod({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e3a5f]/20 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-[#e2e8f0]">{title}</p>
        <p className="text-[10px] text-[#94a3b8]">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors flex items-center gap-2">
        <span className="text-[#00b4d8] group-open:rotate-90 transition-transform">▶</span>
        {q}
      </summary>
      <p className="text-xs text-[#94a3b8]/80 mt-2 ml-5 leading-relaxed">{a}</p>
    </details>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#00b4d8]/10 border border-[#00b4d8]/20 rounded-lg p-3 mt-3 flex gap-2">
      <span className="shrink-0 text-sm">💡</span>
      <p className="text-xs text-[#48cae4]">{children}</p>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-[#0a0e17] border border-[#1e3a5f]/30 rounded-lg p-4 overflow-x-auto">
      <code className="text-xs text-[#48cae4] font-mono whitespace-pre">{code}</code>
    </pre>
  );
}

function PwaStep({ icon, platform, steps }: { icon: string; platform: string; steps: string[] }) {
  return (
    <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e3a5f]/20">
      <p className="text-xs font-semibold text-[#e2e8f0] flex items-center gap-2 mb-2">
        <span>{icon}</span> {platform}
      </p>
      <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-[#94a3b8]">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}
