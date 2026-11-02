import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowUpRight, Instagram, Linkedin, Mail } from "lucide-react";
import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const empty = { name: "", email: "", company: "", project_type: "", message: "" };

const Field = ({ label, name, value, onChange, type = "text", required, textarea, className = "" }) => (
  <label className={`op-field ${className}`}>
    <span className="op-label !text-[10px] !text-zinc-400">{label}{required && " *"}</span>
    {textarea ? (
      <textarea name={name} value={value} onChange={onChange} required={required} rows={4} data-testid={`contact-${name}-input`} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} required={required} data-testid={`contact-${name}-input`} />
    )}
  </label>
);

const ContactForm = () => {
  const { t } = useLang();
  const f = t.contact.form;
  const [data, setData] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${API}/contact`, data);
      setData(empty);
      setDone(true);
      toast.success(f.success);
    } catch {
      toast.error(f.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2" data-testid="contact-form">
      <Field label={f.name} name="name" value={data.name} onChange={onChange} required />
      <Field label={f.email} name="email" type="email" value={data.email} onChange={onChange} required />
      <Field label={f.company} name="company" value={data.company} onChange={onChange} className="sm:col-span-2" />
      <label className="op-field sm:col-span-2">
        <span className="op-label !text-[10px] !text-zinc-400">{f.project}</span>
        <select name="project_type" value={data.project_type} onChange={onChange} data-testid="contact-project-select">
          <option value="">—</option>
          {t.contact.projectTypes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <Field label={f.message} name="message" value={data.message} onChange={onChange} required textarea className="sm:col-span-2" />
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button type="submit" disabled={busy} className="op-btn" data-testid="contact-submit-btn">
          <span>{busy ? f.sending : f.send}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
        {done && <p className="font-body text-sm text-zinc-300" data-testid="contact-success-msg">{f.success}</p>}
      </div>
    </form>
  );
};

const InfoBlock = ({ label, children }) => (
  <div className="border-t border-white/15 pt-5">
    <p className="op-label !text-[10px] !text-zinc-400">{label}</p>
    <div className="mt-3 font-body text-lg text-white">{children}</div>
  </div>
);

export const Contact = () => {
  const { t, lang, site } = useLang();
  const contactInfo = site.contact;
  const l = t.contact.labels;
  return (
    <section id="contact" className="relative bg-[#050505] pt-24 sm:pt-40" data-testid="contact-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="text-center">
          <Reveal className="flex justify-center"><Label>{t.contact.label}</Label></Reveal>
          <MaskLines key={lang} lines={t.contact.title} className="mt-6 font-display text-5xl leading-[1] text-white sm:text-7xl lg:text-8xl" />
        </div>
        <div className="mt-20 grid grid-cols-1 gap-16 pb-24 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-7"><ContactForm /></Reveal>
          <Reveal delay={0.15} className="space-y-8 lg:col-span-5">
            <InfoBlock label={l.email}>
              <a href={`mailto:${contactInfo.email}`} className="op-underline" data-testid="contact-email-link">{contactInfo.email}</a>
            </InfoBlock>
            <InfoBlock label={l.phone}>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="op-underline" data-testid="contact-phone-link">{contactInfo.phone}</a>
            </InfoBlock>
            <InfoBlock label={l.location}><span data-testid="contact-location">{t.contact.location}</span></InfoBlock>
            <InfoBlock label={l.social}>
              <div className="flex gap-3">
                {[[Instagram, contactInfo.instagram, "instagram"], [Linkedin, contactInfo.linkedin, "linkedin"], [Mail, `mailto:${contactInfo.email}`, "mail"]].map(([Icon, href, k]) => (
                  <a key={k} href={href} target="_blank" rel="noreferrer" className="op-icon-btn" data-testid={`contact-social-${k}`} aria-label={k}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </InfoBlock>
          </Reveal>
        </div>
      </div>
      <div className="relative h-[340px] w-full overflow-hidden border-y border-white/10 sm:h-[420px]" data-testid="contact-map">
        <iframe
          title="Casablanca map"
          src="https://www.google.com/maps?q=Casablanca,Morocco&z=12&output=embed"
          className="op-map h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/60" />
      </div>
    </section>
  );
};
