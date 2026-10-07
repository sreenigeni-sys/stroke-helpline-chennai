import { createFileRoute, Link } from "@tanstack/react-router";
import { CompetitionForm, STROKE_PLEDGE } from "@/components/stroke/competition-form";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/competition")({
  head: () =>
    seoHead({
      title: "Stroke awareness competition",
      description:
        "Time is Life art competition for Chennai residents. Submit a .jpeg by 10:00 AM on 23 October 2026.",
      path: "/competition",
      noindex: true,
    }),
  component: CompetitionPage,
});

function CompetitionPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl leading-tight">Stroke awareness competition</h1>
      <p className="font-tamil mt-1 text-base text-ink-soft">பக்கவாத விழிப்புணர்வு போட்டி</p>
      <p className="mt-3 text-sm font-semibold text-ink">
        Theme: Time is Life <span className="font-tamil font-medium">நேரமே உயிர்</span>
      </p>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Rules</h2>
        <p className="font-tamil text-xs text-ink-soft">விதிகள் மற்றும் நிபந்தனைகள்</p>
        <h3 className="mt-3 text-sm font-semibold text-ink">Who can enter</h3>
        <p className="font-tamil text-xs text-ink-soft">தகுதி மற்றும் பிரிவுகள்</p>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink-soft">
          <li>Open only to residents of Chennai. The final event and prizes are in Chennai.</li>
          <li className="font-tamil">சென்னைவாசிகளுக்கு மட்டும். இறுதி விழாவும் பரிசு வழங்கலும் சென்னையில் நடைபெறும்.</li>
          <li>12–15 years. 15–18 years. 18+ years (open to all).</li>
          <li className="font-tamil">வயதுப் பிரிவுகள்: 12–15, 15–18, 18+ (அனைவரும் பங்கேற்கலாம்).</li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Artwork</h2>
        <p className="font-tamil text-xs text-ink-soft">படைப்பு விவரங்கள்</p>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink-soft">
          <li>
            Paper: A4 white sheet, any drawing, sketching, or painting tools. Upload a scanned .jpeg, 3 MB maximum.
          </li>
          <li className="font-tamil">வரைதாள்: A4 வெள்ளைத் தாள். ஸ்கேன் செய்த .jpeg, அதிகபட்சம் 3 MB.</li>
          <li>Digital art: 1080 × 1350 pixels (4:5). Upload a .jpeg, 3 MB maximum.</li>
          <li className="font-tamil">டிஜிட்டல் கலை: 1080 × 1350 பிக்சல். .jpeg, அதிகபட்சம் 3 MB.</li>
          <li>Artwork must be 100% original. Copied work and AI-generated work will be disqualified.</li>
          <li className="font-tamil">
            செயற்கை நுண்ணறிவு (AI) மற்றும் பிறரின் படைப்புகளை நகலெடுத்தால் உடனடியாக தகுதி நீக்கம் செய்யப்படும்.
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Judging</h2>
        <p className="font-tamil text-xs text-ink-soft">நடுவர் தீர்மான அளவுகோல்கள்</p>
        <ol className="mt-2 grid list-decimal gap-1 pl-4 text-sm leading-relaxed text-ink-soft">
          <li>The theme Time is Life, with stroke awareness and the BE-FAST signs: Balance, Eyes, Face, Arm, Speech.</li>
          <li>How clearly the art asks people to act quickly.</li>
          <li>Composition, creativity, and colour.</li>
        </ol>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Dates</h2>
        <p className="font-tamil text-xs text-ink-soft">சமர்ப்பிப்பு விவரங்கள் மற்றும் முக்கிய தேதிகள்</p>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink-soft">
          <li>
            <span className="font-semibold text-ink">Submit by</span> Friday 23 October 2026, 10:00 AM.
            <span className="font-tamil mt-0.5 block">கடைசி நாள்: 23 அக்டோபர் 2026, காலை 10:00.</span>
          </li>
          <li>
            <span className="font-semibold text-ink">Shortlist</span> Saturday 24 October 2026, 6:00 PM.
            <span className="font-tamil mt-0.5 block">தேர்வாளர் அறிவிப்பு: 24 அக்டோபர் 2026, மாலை 6:00.</span>
          </li>
          <li>
            <span className="font-semibold text-ink">Final event and prizes</span> Sunday 25 October 2026, 5:00 PM to 7:00 PM.
            <span className="font-tamil mt-0.5 block">இறுதி விழா: 25 அக்டோபர் 2026, மாலை 5:00 முதல் 7:00 வரை.</span>
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Shortlist and final event</h2>
        <p className="font-tamil text-xs text-ink-soft">தேர்வு முறை மற்றும் இறுதி நிகழ்வு</p>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink-soft">
          <li>
            Art curators from Chennai will shortlist the top 20 entries in each age group and notify them by 6:00 PM on 24 October 2026.
          </li>
          <li>
            Shortlisted participants and their families are invited to the World Stroke Day event on 25 October, 5:00 PM to 7:00 PM, at Avichi College of Arts and Science, Chennai.
          </li>
          <li>
            An elite panel will judge the shortlisted artworks live at the event and announce the top 3 in each age group.
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Prizes and certificates</h2>
        <p className="font-tamil text-xs text-ink-soft">பரிசுகள் மற்றும் சான்றிதழ்கள்</p>
        <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-ink-soft">
          <li>Every qualified participant receives a certificate, on paper or by email.</li>
          <li>Cash prizes in each age group: 1st ₹5,000, 2nd ₹3,000, 3rd ₹1,000.</li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Why this theme</h2>
        <p className="font-tamil text-xs text-ink-soft">கருப்பொருள் பின்னணி: நேரமே உயிர்</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          In a stroke, 1.9 million brain cells are lost every minute. Recognising the signs at once stops that clock. When blood stops flowing to the brain, every second counts.
        </p>
        <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-ink-soft">
          <li>Balance <span className="font-tamil">சமநிலை இழப்பு</span></li>
          <li>Eyes <span className="font-tamil">பார்வை மங்குதல்</span></li>
          <li>Face <span className="font-tamil">முகம் கோணுதல்</span></li>
          <li>Arm <span className="font-tamil">கை தளர்ச்சி</span></li>
          <li>Speech <span className="font-tamil">பேச்சு குழறல்</span></li>
          <li>
            Time <span className="font-tamil">உடனடி சிகிச்சை — நேரமே உயிர்</span>
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Partners</h2>
        <p className="font-tamil text-xs text-ink-soft">அமைப்பாளர்கள்</p>
        <ul className="mt-2 grid gap-1 text-sm leading-relaxed text-ink-soft">
          <li>
            <span className="font-semibold text-ink">Organised by</span> Arunai Neuro Foundation
          </li>
          <li>
            <span className="font-semibold text-ink">Schools</span> AVM Rajeswari The School and Avichi Higher Secondary School
          </li>
          <li>
            <span className="font-semibold text-ink">College</span> Avichi College of Arts and Science
          </li>
          <li>
            <span className="font-semibold text-ink">Art juror</span> Sketchbook Designs
          </li>
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-ink">Help with your entry</h2>
        <p className="font-tamil text-xs text-ink-soft">உதவிக்கு</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          WhatsApp{" "}
          <a href="https://wa.me/919047452258" className="font-semibold text-[#1b4fad]">
            90474 52258
          </a>
        </p>
      </section>

      <section className="mt-5 rounded-card border border-line bg-paper-deep px-4 py-4">
        <h2 className="text-sm font-semibold text-ink">Pledge</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{STROKE_PLEDGE}</p>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Submission</h2>
        <p className="font-tamil text-xs text-ink-soft">சமர்ப்பிப்பது எப்படி: இங்கே பதிவேற்றவும்.</p>
        <div className="mt-3">
          <CompetitionForm />
        </div>
      </section>
    </main>
  );
}
