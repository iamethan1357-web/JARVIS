"use client";

import { useState } from "react";

export default function DeployPage() {
  const [copied, setCopied] = useState("");

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e2e8f0] overflow-y-auto">
      <header className="border-b border-[#1e3a5f]/50 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-[#00b4d8] flex items-center justify-center bg-[#00b4d8]/10">
              <span className="text-[#00b4d8] font-bold text-sm font-mono">J</span>
            </div>
            <span className="text-[#00b4d8] font-bold tracking-wider font-mono">J.A.R.V.I.S.</span>
          </a>
          <a href="/" className="text-xs text-[#94a3b8] hover:text-[#00b4d8]">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Deploy JARVIS to Vercel</h1>
          <p className="text-[#94a3b8] max-w-xl mx-auto text-sm">
            Step-by-step guide to get JARVIS permanently hosted online. Takes ~15 minutes. 100% free.
          </p>
        </div>

        {/* Common Error Banner */}
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4">
          <p className="text-xs text-[#ef4444] font-bold mb-1">⚠️ Common Errors and How to Avoid Them</p>
          <ul className="text-xs text-[#94a3b8] space-y-1 list-disc list-inside">
            <li><strong>&ldquo;Repository does not contain the requested branch&rdquo;</strong> — Your GitHub repo is empty. You must push code FIRST (Step 3), then import to Vercel (Step 5).</li>
            <li><strong>&ldquo;Missing .env&rdquo;</strong> — Don&apos;t commit your .env file. Add DATABASE_URL in Vercel&apos;s dashboard instead (Step 6).</li>
          </ul>
        </div>

        {/* What you need */}
        <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-3">📋 Create These Free Accounts First</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AccountCard name="GitHub" url="https://github.com/signup" purpose="Stores your code" />
            <AccountCard name="Neon" url="https://console.neon.tech/signup" purpose="Free database" />
            <AccountCard name="Vercel" url="https://vercel.com/signup" purpose="Hosts the app" />
          </div>
          <p className="text-[10px] text-[#94a3b8]/50 mt-3 text-center">Sign up for all 3 before starting. No credit card needed.</p>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 1: Database */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="🗄️" title="Step 1: Create Your Database on Neon" />

        <Card>
          <ol className="space-y-4">
            <Li n="1">
              Go to <A href="https://console.neon.tech">console.neon.tech</A> and sign in (use Google or GitHub)
            </Li>
            <Li n="2">
              Click <B>New Project</B>
              <ul className="list-disc list-inside mt-1 ml-4 text-[#94a3b8]/80">
                <li>Project name: <M>jarvis</M></li>
                <li>Region: pick closest to you</li>
                <li>Click <B>Create Project</B></li>
              </ul>
            </Li>
            <Li n="3">
              After creation, you&apos;ll see <B>Connection Details</B>. Copy the <B>Connection String</B>:
              <Copyable text="postgresql://username:AbCdEfG@ep-cool-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require" id="neon" copied={copied} onCopy={copy} label="(yours will look similar to this)" />
            </Li>
          </ol>
          <Warning>
            <B>Save this connection string somewhere safe!</B> You need it in Step 6. It contains your database password.
          </Warning>
        </Card>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 2: GitHub Repo */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="📂" title="Step 2: Create a GitHub Repository" />

        <Card>
          <ol className="space-y-4">
            <Li n="1">
              Go to <A href="https://github.com/new">github.com/new</A>
            </Li>
            <Li n="2">
              Fill in:
              <ul className="list-disc list-inside mt-1 ml-4 text-[#94a3b8]/80">
                <li>Repository name: <M>jarvis</M></li>
                <li>Visibility: <B>Private</B></li>
                <li><B>DO NOT</B> check &ldquo;Add a README file&rdquo;</li>
                <li><B>DO NOT</B> select a .gitignore template</li>
              </ul>
            </Li>
            <Li n="3">
              Click <B>Create repository</B>. You&apos;ll see an empty repo page with instructions. Keep this page open.
            </Li>
          </ol>
          <Tip>The repo MUST be empty for the next step to work. Don&apos;t initialize it with anything.</Tip>
        </Card>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 3: Push Code */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="⬆️" title="Step 3: Download JARVIS Code & Push to GitHub" />

        <Card>
          <p className="mb-3">You have <B>two options</B> to get the code into GitHub:</p>

          {/* Option A */}
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#00b4d8]/20 mb-4">
            <p className="text-xs font-bold text-[#00b4d8] mb-3">Option A: Using Terminal / Command Line (Recommended)</p>
            <ol className="space-y-3">
              <Li n="1">
                Download the code from this sandbox using the <B>Download</B> button (top-right of editor)
              </Li>
              <Li n="2">
                Unzip the downloaded file on your computer
              </Li>
              <Li n="3">
                Open a terminal in that folder and run these commands one by one:
                <Code text={`git init
git add .
git commit -m "JARVIS initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jarvis.git
git push -u origin main`} id="gitcmds" copied={copied} onCopy={copy} />
                <Warning><B>Replace YOUR_USERNAME</B> with your actual GitHub username!</Warning>
              </Li>
            </ol>
          </div>

          {/* Option B */}
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#1e3a5f]/30">
            <p className="text-xs font-bold text-[#f59e0b] mb-3">Option B: Upload via GitHub Website (No terminal needed)</p>
            <ol className="space-y-3">
              <Li n="1">Download and unzip the code from this sandbox</Li>
              <Li n="2">Go to your empty GitHub repo page</Li>
              <Li n="3">Click <B>&ldquo;uploading an existing file&rdquo;</B> link</Li>
              <Li n="4">Drag and drop ALL project files/folders into the upload area</Li>
              <Li n="5">Click <B>&ldquo;Commit changes&rdquo;</B></Li>
            </ol>
            <Warning>Make sure to upload ALL files and folders including <M>src/</M>, <M>public/</M>, <M>package.json</M>, <M>next.config.ts</M>, etc. But <B>DO NOT upload</B> the <M>.env</M> file or <M>node_modules/</M> folder.</Warning>
          </div>

          {/* Critical warning */}
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3 mt-4">
            <p className="text-xs text-[#ef4444] font-bold">🚫 Files to NEVER Upload/Commit:</p>
            <ul className="text-xs text-[#94a3b8] mt-1 space-y-0.5 list-disc list-inside">
              <li><M>.env</M> — contains database password (add via Vercel dashboard instead)</li>
              <li><M>node_modules/</M> — too large, Vercel installs automatically</li>
              <li><M>.next/</M> — build output, Vercel builds automatically</li>
            </ul>
          </div>
        </Card>

        {/* Verification */}
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4">
          <p className="text-xs text-[#10b981] font-bold mb-1">✅ Verify Before Moving On</p>
          <p className="text-xs text-[#94a3b8]">
            Go to <M>github.com/YOUR_USERNAME/jarvis</M>. You should see files like <M>package.json</M>, <M>src/</M>, <M>public/</M>, <M>next.config.ts</M>. 
            If the repo still says &ldquo;empty&rdquo;, the push didn&apos;t work — try again.
          </p>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 4: Vercel - NOT YET */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="🚀" title="Step 4: Connect Vercel to GitHub" />

        <Card>
          <ol className="space-y-4">
            <Li n="1">
              Go to <A href="https://vercel.com/new">vercel.com/new</A> (sign in with GitHub if not already)
            </Li>
            <Li n="2">
              You&apos;ll see <B>&ldquo;Import Git Repository&rdquo;</B>. Find your <M>jarvis</M> repo in the list.
              <Tip>If you don&apos;t see it, click <B>&ldquo;Adjust GitHub App Permissions&rdquo;</B> and grant access to the repo.</Tip>
            </Li>
            <Li n="3">
              Click <B>&ldquo;Import&rdquo;</B> next to your jarvis repository.
            </Li>
          </ol>
        </Card>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 5: Configure */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="⚙️" title="Step 5: Configure Project Settings" />

        <Card>
          <p className="mb-3">On the <B>&ldquo;Configure Project&rdquo;</B> page, you need to set two things:</p>

          {/* A: Build Command - AUTOMATIC */}
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#10b981]/30 mb-4">
            <p className="text-xs font-bold text-[#10b981] mb-2">A. Build Command — Already Configured ✓</p>
            <p className="text-[11px] text-[#94a3b8]">
              The project&apos;s <M>package.json</M> already has the correct build command. 
              Vercel will automatically run <M>npx drizzle-kit push && next build</M> which creates all database tables and then builds the app.
              <B> You don&apos;t need to change anything here.</B>
            </p>
          </div>

          {/* B: Environment Variables */}
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#f59e0b]/30">
            <p className="text-xs font-bold text-[#f59e0b] mb-2">B. Add Environment Variable (CRITICAL)</p>
            <ol className="space-y-2">
              <Li n="1">Expand <B>&ldquo;Environment Variables&rdquo;</B></Li>
              <Li n="2">
                Add this variable:
                <div className="bg-[#1a2234] rounded-lg p-3 mt-2 border border-[#1e3a5f]/30">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div>
                      <p className="text-[10px] text-[#94a3b8] mb-1">Name:</p>
                      <code className="text-[#48cae4] bg-[#0a0e17] px-2 py-1 rounded text-xs">DATABASE_URL</code>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#94a3b8] mb-1">Value:</p>
                      <code className="text-[#48cae4] bg-[#0a0e17] px-2 py-1 rounded text-xs break-all">
                        postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require
                      </code>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#f59e0b] mt-2">👆 Paste YOUR Neon connection string from Step 1!</p>
                </div>
              </Li>
              <Li n="3">Click <B>&ldquo;Add&rdquo;</B></Li>
            </ol>

            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-[#ef4444]">
                <B>This is why you got the error!</B> Without this variable, the build fails.
                The .env file is only for local development — on Vercel, you add variables here.
              </p>
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 6: Deploy */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="🎯" title='Step 6: Click "Deploy"' />

        <Card>
          <ol className="space-y-3">
            <Li n="1">Click the big <B>&ldquo;Deploy&rdquo;</B> button</Li>
            <Li n="2">
              Wait 2-3 minutes. Vercel will show a build log. You should see:
              <div className="bg-[#0a0e17] rounded-lg p-3 mt-2 font-mono text-[10px] space-y-0.5 border border-[#1e3a5f]/20">
                <p className="text-[#94a3b8]">Installing dependencies...</p>
                <p className="text-[#94a3b8]">Running build command: npx drizzle-kit push && next build</p>
                <p className="text-[#10b981]">[✓] Changes applied (database tables created)</p>
                <p className="text-[#94a3b8]">Creating optimized production build...</p>
                <p className="text-[#10b981]">✓ Compiled successfully</p>
                <p className="text-[#10b981] font-bold">🎉 Congratulations! Your project is deployed.</p>
              </div>
            </Li>
            <Li n="3">
              Vercel gives you your permanent URL:
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3 mt-2 text-center">
                <code className="text-[#10b981] text-sm font-mono font-bold">https://jarvis-xxxxx.vercel.app</code>
                <p className="text-[10px] text-[#94a3b8] mt-1">This URL is permanent and free forever!</p>
              </div>
            </Li>
          </ol>
        </Card>

        {/* ══════════════════════════════════════════ */}
        {/* STEP 7: APK */}
        {/* ══════════════════════════════════════════ */}
        <H2 emoji="📱" title="Step 7: Generate APK from Your Live URL" />

        <Card>
          <ol className="space-y-3">
            <Li n="1">Open your deployed JARVIS: <M>https://jarvis-xxxxx.vercel.app</M></Li>
            <Li n="2">Click <B>Install APK</B> in the sidebar (or go to <M>/install</M>)</Li>
            <Li n="3">Follow the PWABuilder guide to generate and download your APK</Li>
            <Li n="4">Install the APK on your Android phone</Li>
          </ol>

          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4 mt-4 text-center">
            <p className="text-lg font-bold text-[#10b981]">🎉 You&apos;re Done!</p>
            <p className="text-sm text-[#94a3b8] mt-1">JARVIS is permanently online and installed on your phone.</p>
          </div>
        </Card>

        {/* Troubleshooting */}
        <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold">🔧 Troubleshooting</h3>
          <div className="space-y-3">
            <Faq q="Error: 'repository does not contain the requested branch'" a="Your GitHub repo is empty — code was not pushed. Go back to Step 3 and make sure you see files in your GitHub repo before importing to Vercel." />
            <Faq q="Error: 'DATABASE_URL is required'" a="You didn't add the environment variable in Step 5B. Go to Vercel → your project → Settings → Environment Variables → add DATABASE_URL with your Neon connection string → Redeploy." />
            <Faq q="Error: 'connection refused' or 'ETIMEDOUT'" a="Your Neon DATABASE_URL might be wrong. Go to Neon Console → Connection Details → copy the connection string again. Make sure it ends with ?sslmode=require." />
            <Faq q="Build succeeds but app shows error" a="Go to Vercel → your project → Settings → Environment Variables → verify DATABASE_URL is correct. Then click Deployments → Redeploy." />
            <Faq q="How to redeploy after fixing an error?" a="Go to Vercel → your project → Deployments tab → click the 3-dot menu on the latest deployment → Redeploy." />
            <Faq q="How to update the app later?" a="Edit code → push to GitHub (git push). Vercel auto-redeploys within 2 minutes." />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pb-8">
          <a href="/install" className="px-5 py-2.5 bg-[#00b4d8]/20 border border-[#00b4d8]/40 text-[#00b4d8] rounded-xl text-sm hover:bg-[#00b4d8]/30 transition-colors">
            📲 APK Install Guide
          </a>
          <a href="/" className="px-5 py-2.5 border border-[#1e3a5f]/40 text-[#94a3b8] rounded-xl text-sm hover:text-[#e2e8f0] transition-colors">
            ← Command Center
          </a>
        </div>
      </main>
    </div>
  );
}

/* ─── Reusable Components ─── */

function H2({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-base font-bold">{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#111827] border border-[#1e3a5f]/40 rounded-xl p-5 text-xs text-[#94a3b8] leading-relaxed space-y-2">{children}</div>;
}

function Li({ n, children }: { n: string | number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="w-6 h-6 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#00b4d8] text-[10px] font-bold">{n}</span>
      <div className="flex-1">{children}</div>
    </li>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-[#e2e8f0] font-semibold">{children}</strong>;
}

function M({ children }: { children: React.ReactNode }) {
  return <code className="text-[#48cae4] bg-[#48cae4]/10 px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] underline underline-offset-2 hover:text-[#48cae4]">{children}</a>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#00b4d8]/10 border border-[#00b4d8]/20 rounded-lg p-2.5 mt-2 flex gap-2">
      <span className="shrink-0">💡</span>
      <p className="text-[11px] text-[#48cae4]">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-2.5 mt-2 flex gap-2">
      <span className="shrink-0">⚠️</span>
      <p className="text-[11px] text-[#f59e0b]">{children}</p>
    </div>
  );
}

function AccountCard({ name, url, purpose }: { name: string; url: string; purpose: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e3a5f]/20 hover:border-[#00b4d8]/30 transition-colors text-center">
      <p className="text-xs font-bold text-[#e2e8f0]">{name}</p>
      <p className="text-[10px] text-[#94a3b8] mt-0.5">{purpose}</p>
      <p className="text-[10px] text-[#00b4d8] mt-1">Sign up free →</p>
    </a>
  );
}

function Copyable({ text, id, label, copied, onCopy }: { text: string; id: string; label?: string; copied: string; onCopy: (t: string, id: string) => void }) {
  return (
    <div className="mt-2">
      {label && <p className="text-[10px] text-[#94a3b8]/60 mb-1">{label}</p>}
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-[#0a0e17] border border-[#1e3a5f]/30 px-3 py-2 rounded-lg text-[11px] text-[#48cae4] font-mono truncate">{text}</code>
        <button onClick={() => onCopy(text, id)} className={`px-3 py-2 rounded-lg text-[10px] shrink-0 ${copied === id ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#1a2234] text-[#94a3b8] hover:text-[#00b4d8]"}`}>
          {copied === id ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function Code({ text, id, copied, onCopy }: { text: string; id: string; copied: string; onCopy: (t: string, id: string) => void }) {
  return (
    <div className="mt-2 relative">
      <pre className="bg-[#0a0e17] border border-[#1e3a5f]/30 rounded-lg p-3 overflow-x-auto">
        <code className="text-[11px] text-[#48cae4] font-mono whitespace-pre">{text}</code>
      </pre>
      <button onClick={() => onCopy(text, id)} className={`absolute top-2 right-2 px-2 py-1 rounded text-[9px] ${copied === id ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#1a2234] text-[#94a3b8] hover:text-[#00b4d8]"}`}>
        {copied === id ? "✓" : "Copy"}
      </button>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-medium text-[#94a3b8] hover:text-[#e2e8f0] flex items-center gap-2">
        <span className="text-[#00b4d8] group-open:rotate-90 transition-transform">▶</span> {q}
      </summary>
      <p className="text-xs text-[#94a3b8]/80 mt-2 ml-5 leading-relaxed">{a}</p>
    </details>
  );
}
