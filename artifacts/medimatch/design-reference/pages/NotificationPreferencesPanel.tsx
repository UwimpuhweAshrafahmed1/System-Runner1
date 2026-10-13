import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Mail, MessageCircle, Save, ShieldCheck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NotificationPreferencesPanel({ isStaff }: { isStaff: boolean }) {
  const preferencesQuery = trpc.notifications.preferences.useQuery();
  const [phoneE164, setPhoneE164] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [staffReminderOptIn, setStaffReminderOptIn] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveMutation = trpc.notifications.savePreferences.useMutation({
    onSuccess: data => {
      setPhoneE164(data.phoneE164 ?? "");
      setEmailOptIn(data.emailOptIn === 1);
      setSmsOptIn(data.smsOptIn === 1);
      setStaffReminderOptIn(data.staffReminderOptIn !== 0);
      setNotice("Notification preferences saved.");
      setError(null);
    },
    onError: mutationError => {
      setError(mutationError.message);
      setNotice(null);
    },
  });

  useEffect(() => {
    if (!preferencesQuery.data) return;
    setPhoneE164(preferencesQuery.data.phoneE164 ?? "");
    setEmailOptIn(preferencesQuery.data.emailOptIn !== 0);
    setSmsOptIn(preferencesQuery.data.smsOptIn === 1);
    setStaffReminderOptIn(preferencesQuery.data.staffReminderOptIn !== 0);
  }, [preferencesQuery.data]);

  const handleSave = () => {
    setNotice(null);
    setError(null);
    saveMutation.mutate({ phoneE164: phoneE164.trim() || null, emailOptIn, smsOptIn, staffReminderOptIn });
  };

  return (
    <section className="care-preferences">
      <div className="care-section-heading">
        <div><span className="care-eyebrow"><Bell size={14} /> Notification preferences</span><h2>Keep the right people in the loop.</h2><p>Choose where MediMATCH sends appointment reminders. You can change these choices at any time.</p></div>
        <span className="care-preferences__privacy"><ShieldCheck size={15} /> Your choices are private</span>
      </div>
      <div className="care-preferences__grid">
        <label className="care-field care-field--phone"><span>Mobile number <small>International format</small></span><input type="tel" value={phoneE164} onChange={event => setPhoneE164(event.target.value)} placeholder="+447700900123" autoComplete="tel" /></label>
        <label className={`care-toggle ${emailOptIn ? "is-active" : ""}`}><input type="checkbox" checked={emailOptIn} onChange={event => setEmailOptIn(event.target.checked)} /><span className="care-toggle__icon"><Mail size={17} /></span><span><strong>Email reminders</strong><small>Appointment timing and status updates.</small></span></label>
        <label className={`care-toggle ${smsOptIn ? "is-active" : ""}`}><input type="checkbox" checked={smsOptIn} onChange={event => setSmsOptIn(event.target.checked)} /><span className="care-toggle__icon"><MessageCircle size={17} /></span><span><strong>SMS reminders</strong><small>Short reminders to your mobile number.</small></span></label>
        {isStaff && <label className={`care-toggle ${staffReminderOptIn ? "is-active" : ""}`}><input type="checkbox" checked={staffReminderOptIn} onChange={event => setStaffReminderOptIn(event.target.checked)} /><span className="care-toggle__icon"><Bell size={17} /></span><span><strong>Staff queue reminders</strong><small>Upcoming patient queue alerts for your care desk.</small></span></label>}
      </div>
      {preferencesQuery.error && <div className="care-alert care-alert--error" role="alert"><X size={16} /> Unable to load notification preferences. Refresh and try again.</div>}
      {error && <div className="care-alert care-alert--error" role="alert"><X size={16} /> {error}</div>}
      {notice && <div className="care-alert care-alert--success" role="status"><CheckCircle2 size={16} /> {notice}</div>}
      <div className="care-preferences__footer"><span>SMS requires a valid international number and explicit opt-in.</span><button className="care-secondary-button" disabled={saveMutation.isPending || preferencesQuery.isLoading} onClick={handleSave}><Save size={15} /> {saveMutation.isPending ? "Saving…" : "Save preferences"}</button></div>
    </section>
  );
}
