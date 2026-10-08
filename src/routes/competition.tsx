import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CompetitionForm, STROKE_PLEDGE } from "@/components/stroke/competition-form";
import { cn } from "@/lib/cn";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/competition")({
  head: () =>
    seoHead({
      title: "Stroke response awareness competition",
      description: "Submit artwork for the stroke response awareness competition.",
      path: "/competition",
      noindex: true,
    }),
  component: CompetitionPage,
});

type Lang = "en" | "ta";

function CompetitionPage() {
  const [rules, setRules] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const ta = lang === "ta";
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
          <Link to="/" className="mt-2 block text-sm font-semibold text-[#1b4fad]">
            {ta ? "பின்" : "Back"}
          </Link>
        </div>
        <div className="flex rounded-full border border-line p-0.5" role="group" aria-label="Language">
          {(
            [
              ["en", "English"],
              ["ta", "தமிழ்"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={lang === id}
              onClick={() => setLang(id)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-semibold",
                id === "ta" && "font-tamil",
                lang === id ? "bg-[#1b4fad] text-white" : "text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <h1 className={cn("font-display mt-6 text-3xl leading-tight", ta && "font-tamil text-2xl")}>
        {ta ? "பக்கவாத எதிர்வினை விழிப்புணர்வு போட்டி" : "Stroke response awareness competition"}
      </h1>
      <button
        type="button"
        aria-expanded={rules}
        onClick={() => setRules((open) => !open)}
        className={cn("mt-4 text-left text-sm font-semibold text-[#1b4fad] underline", ta && "font-tamil")}
      >
        {ta
          ? "தகவல், விதிகள் மற்றும் நிபந்தனைகளுக்கு இங்கே சொடுக்கவும்"
          : "For information, rules and regulations click here"}
      </button>
      {rules ? <CompetitionRules lang={lang} /> : null}
      <section className="mt-5 rounded-card border border-line bg-paper-deep px-4 py-4">
        <h2 className="text-sm font-semibold text-ink">{ta ? "உறுதிமொழி" : "Pledge"}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{STROKE_PLEDGE}</p>
      </section>
      <section className="mt-6">
        <h2 className={cn("text-lg font-semibold", ta && "font-tamil")}>{ta ? "சமர்ப்பிப்பு" : "Submission"}</h2>
        <div className="mt-3">
          <CompetitionForm />
        </div>
      </section>
    </main>
  );
}

function RulesList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CompetitionRules({ lang }: { lang: Lang }) {
  const ta = lang === "ta";
  return (
    <div className={cn("mt-4", ta && "font-tamil")}>
      <section>
        <h2 className="text-sm font-semibold text-ink">{ta ? "விதிகள் மற்றும் நிபந்தனைகள்" : "Rules"}</h2>
        <h3 className="mt-3 text-sm font-semibold text-ink">{ta ? "தகுதி மற்றும் பிரிவுகள்" : "Who can enter"}</h3>
        <RulesList
          items={
            ta
              ? [
                  "சென்னைவாசிகளுக்கு மட்டும். இறுதி விழாவும் பரிசு வழங்கலும் சென்னையில் நடைபெறும்.",
                  "வயதுப் பிரிவுகள்: 12–15, 15–18, 18+ (அனைவரும் பங்கேற்கலாம்).",
                ]
              : [
                  "Open only to residents of Chennai. The final event and prizes are in Chennai.",
                  "12–15 years. 15–18 years. 18+ years (open to all).",
                ]
          }
        />
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "படைப்பு விவரங்கள்" : "Artwork"}</h2>
        <RulesList
          items={
            ta
              ? [
                  "வரைதாள்: A4 வெள்ளைத் தாள். ஸ்கேன் செய்த .jpeg, அதிகபட்சம் 3 MB.",
                  "டிஜிட்டல் கலை: 1080 × 1350 பிக்சல். .jpeg, அதிகபட்சம் 3 MB.",
                  "செயற்கை நுண்ணறிவு (AI) மற்றும் பிறரின் படைப்புகளை நகலெடுத்தால் உடனடியாக தகுதி நீக்கம் செய்யப்படும்.",
                ]
              : [
                  "Paper: A4 white sheet, any drawing, sketching, or painting tools. Upload a scanned .jpeg, 3 MB maximum.",
                  "Digital art: 1080 × 1350 pixels (4:5). Upload a .jpeg, 3 MB maximum.",
                  "Artwork must be 100% original. Copied work and AI-generated work will be disqualified.",
                ]
          }
        />
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "நடுவர் தீர்மான அளவுகோல்கள்" : "Judging"}</h2>
        <ol className="mt-2 grid list-decimal gap-1 pl-4 text-sm leading-relaxed text-ink">
          {(ta
            ? [
                "கருப்பொருள் நேரமே உயிர். பக்கவாத விழிப்புணர்வும் BE-FAST அறிகுறிகளும்: சமநிலை, கண்கள், முகம், கை, பேச்சு.",
                "மக்களை உடனே செயல்படச் சொல்லும் தெளிவு.",
                "அமைப்பு, படைப்பாற்றல், வண்ணம்.",
              ]
            : [
                "The theme Time is Life, with stroke awareness and the BE-FAST signs: Balance, Eyes, Face, Arm, Speech.",
                "How clearly the art asks people to act quickly.",
                "Composition, creativity, and colour.",
              ]
          ).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">
          {ta ? "சமர்ப்பிப்பு விவரங்கள் மற்றும் முக்கிய தேதிகள்" : "Dates"}
        </h2>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink">
          {(ta
            ? [
                ["கடைசி நாள்", "23 அக்டோபர் 2026, காலை 10:00."],
                ["தேர்வாளர் அறிவிப்பு", "24 அக்டோபர் 2026, மாலை 6:00."],
                ["இறுதி விழா", "25 அக்டோபர் 2026, மாலை 5:00 முதல் 7:00 வரை."],
              ]
            : [
                ["Submit by", "Friday 23 October 2026, 10:00 AM."],
                ["Shortlist", "Saturday 24 October 2026, 6:00 PM."],
                ["Final event and prizes", "Sunday 25 October 2026, 5:00 PM to 7:00 PM."],
              ]
          ).map(([label, detail]) => (
            <li key={label}>
              <span className="font-semibold">{label}</span> {detail}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "தேர்வு முறை மற்றும் இறுதி நிகழ்வு" : "Shortlist and final event"}</h2>
        <RulesList
          items={
            ta
              ? [
                  "சென்னை கலைத் தேர்வாளர்கள் ஒவ்வொரு வயதுப் பிரிவிலும் முதல் 20 படைப்புகளைத் தேர்ந்தெடுத்து, 24 அக்டோபர் 2026 மாலை 6:00 மணிக்குள் தெரிவிப்பார்கள்.",
                  "தேர்வானவர்களும் குடும்பத்தினரும் 25 அக்டோபர், மாலை 5:00 முதல் 7:00 வரை, சென்னை அவிச்சி கலை அறிவியல் கல்லூரியில் நடைபெறும் உலக பக்கவாத தின நிகழ்வுக்கு அழைக்கப்படுகிறார்கள்.",
                  "நிகழ்வில் ஒரு சிறப்புக் குழு படைப்புகளை நேரடியாக மதிப்பீடு செய்து, ஒவ்வொரு பிரிவிலும் முதல் 3 இடங்களை அறிவிக்கும்.",
                ]
              : [
                  "Art curators from Chennai will shortlist the top 20 entries in each age group and notify them by 6:00 PM on 24 October 2026.",
                  "Shortlisted participants and their families are invited to the World Stroke Day event on 25 October, 5:00 PM to 7:00 PM, at Avichi College of Arts and Science, Chennai.",
                  "An elite panel will judge the shortlisted artworks live at the event and announce the top 3 in each age group.",
                ]
          }
        />
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "பரிசுகள் மற்றும் சான்றிதழ்கள்" : "Prizes and certificates"}</h2>
        <RulesList
          items={
            ta
              ? [
                  "தகுதி பெற்ற ஒவ்வொருவருக்கும் சான்றிதழ், தாளில் அல்லது மின்னஞ்சலில்.",
                  "ஒவ்வொரு வயதுப் பிரிவிலும் பரிசுத்தொகை: முதல் ₹5,000, இரண்டாம் ₹3,000, மூன்றாம் ₹1,000.",
                ]
              : [
                  "Every qualified participant receives a certificate, on paper or by email.",
                  "Cash prizes in each age group: 1st ₹5,000, 2nd ₹3,000, 3rd ₹1,000.",
                ]
          }
        />
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "கருப்பொருள் பின்னணி: நேரமே உயிர்" : "Why this theme"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {ta
            ? "பக்கவாதத்தில் ஒவ்வொரு நிமிடமும் 19 இலட்சம் மூளை செல்கள் இழக்கப்படுகின்றன. அறிகுறிகளை உடனே அறிந்தால் அந்த இழப்பை நிறுத்தலாம். மூளைக்கு இரத்தம் செல்வது நின்றால் ஒவ்வொரு வினாடியும் முக்கியம்."
            : "In a stroke, 1.9 million brain cells are lost every minute. Recognising the signs at once stops that clock. When blood stops flowing to the brain, every second counts."}
        </p>
        <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-ink">
          {(ta
            ? ["சமநிலை இழப்பு", "பார்வை மங்குதல்", "முகம் கோணுதல்", "கை தளர்ச்சி", "பேச்சு குழறல்", "உடனடி சிகிச்சை — நேரமே உயிர்"]
            : ["Balance", "Eyes", "Face", "Arm", "Speech", "Time"]
          ).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "அமைப்பாளர்கள்" : "Partners"}</h2>
        <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-ink">
          {(ta
            ? [
                ["அமைப்பாளர்", "அருணை நியூரோ அறக்கட்டளை"],
                ["பள்ளிகள்", "AVM ராஜேஸ்வரி பள்ளி மற்றும் அவிச்சி மேல்நிலைப் பள்ளி"],
                ["கல்லூரி", "அவிச்சி கலை அறிவியல் கல்லூரி"],
                ["கலை நடுவர்", "Sketchbook Designs"],
              ]
            : [
                ["Organised by", "Arunai Neuro Foundation"],
                ["Schools", "AVM Rajeswari The School and Avichi Higher Secondary School"],
                ["College", "Avichi College of Arts and Science"],
                ["Art juror", "Sketchbook Designs"],
              ]
          ).map(([label, detail]) => (
            <li key={label}>
              <span className="font-semibold">{label}</span> {detail}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">{ta ? "உதவிக்கு" : "Help with your entry"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {ta ? "வாட்ஸ்அப் " : "WhatsApp "}
          <a href="https://wa.me/919047452258" className="font-semibold text-[#1b4fad]">
            90474 52258
          </a>
        </p>
      </section>
    </div>
  );
}
