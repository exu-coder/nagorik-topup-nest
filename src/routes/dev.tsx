import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dev")({
  head: () => ({ meta: [{ title: "Admin Access · MFJ TOP UP" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function enter(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      if (!data.session) throw new Error("No active session returned.");
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (roleError) throw roleError;
      if (!isAdmin) {
        const { data: exists, error: existsError } = await supabase.rpc("admin_exists");
        if (existsError) throw existsError;
        if (exists) {
          await supabase.auth.signOut();
          throw new Error("This account does not have admin access.");
        }
        const { data: claimed, error: claimError } = await supabase.rpc("claim_first_admin");
        if (claimError) throw claimError;
        if (!claimed) {
          await supabase.auth.signOut();
          throw new Error("The first-admin slot has already been claimed.");
        }
      }
      await navigate({ to: "/dev/dashboard" });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); }
    finally { setBusy(false); }
  }

  async function createFirstAdmin() {
    if (!email.trim() || password.length < 8) { setError("Enter an email and a password with at least 8 characters."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const { data: exists, error: existsError } = await supabase.rpc("admin_exists");
      if (existsError) throw existsError;
      if (exists) throw new Error("An admin already exists. Ask an existing admin to grant access.");
      const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
      if (signUpError) throw signUpError;
      if (!data.session || !data.user) {
        setNotice("Account created. Confirm your email, then sign in and use the first-admin setup if no admin has claimed the panel yet.");
        return;
      }
      const { data: claimed, error: claimError } = await supabase.rpc("claim_first_admin");
      if (claimError) throw claimError;
      if (!claimed) throw new Error("The first-admin slot has already been claimed.");
      await navigate({ to: "/dev/dashboard" });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create admin."); }
    finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-[100] grid min-h-screen place-items-center overflow-y-auto bg-[#080d18] px-4 py-10 text-white">
    <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[110px]" /><div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-blue-600/10 blur-[130px]" /><div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage:"linear-gradient(rgba(148,163,184,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.35) 1px,transparent 1px)",backgroundSize:"42px 42px"}} /></div>
    <div className="relative w-full max-w-[430px]">
      <div className="mb-8 flex items-center justify-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Activity size={24}/></div><div><p className="font-display text-xl font-bold tracking-wide">MFJ <span className="text-cyan-300">CONTROL</span></p><p className="text-[10px] uppercase tracking-[.28em] text-slate-500">Secure administration</p></div></div>
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
        <div className="mb-7"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300"><ShieldCheck size={13}/> ADMIN AUTHENTICATION</div><h1 className="font-display text-3xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to manage orders, customers and your top-up catalogue.</p></div>
        <form onSubmit={enter} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">EMAIL ADDRESS<input autoComplete="username" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"/></label>
          <label className="block text-xs font-semibold text-slate-300">PASSWORD<div className="relative mt-2"><input autoComplete="current-password" type={show?"text":"password"} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 pr-12 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Toggle password visibility">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
          {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-300">{error}</p>}
          {notice && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">{notice}</p>}
          <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60">{busy?"Please wait":"Sign in securely"} <ArrowRight size={17}/></button>
        </form>
        <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-white/10"/><span className="text-[10px] uppercase tracking-widest text-slate-600">First-time setup</span><span className="h-px flex-1 bg-white/10"/></div>
        <button disabled={busy} onClick={createFirstAdmin} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:opacity-50"><Sparkles size={15}/> Create the first admin account</button>
        <p className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-600"><LockKeyhole size={12}/> Protected by Supabase Auth + database role policies</p>
      </div>
      <p className="mt-6 text-center text-[11px] text-slate-600">MFJ TOP UP · Private admin area · <a href="/" className="text-slate-400 hover:text-white">Back to store</a></p>
    </div>
  </div>;
}
