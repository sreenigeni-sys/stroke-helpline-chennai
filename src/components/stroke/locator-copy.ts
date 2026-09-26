import type { Lang } from "@/components/stroke/session";

export function locatorCopy(lang: Lang | null) {
  const ta = lang === "ta";
  return {
    ta,
    possible(signs: string) {
      return ta ? `பக்கவாத அறிகுறி இருக்கலாம்: ${signs}.` : `Possible stroke signs: ${signs}.`;
    },
    travel: ta
      ? "போகும் முன் மருத்துவமனையை அழையுங்கள். குழுவும் ஸ்கேன்னரும் மணிக்கு மாறும்."
      : "If you travel, call the hospital before you arrive — teams and scanners change by the hour.",
    unsure(signs: string) {
      return ta ? `உறுதி இல்லை: ${signs}.` : `Not sure about: ${signs}.`;
    },
    treatUrgent: ta ? "அதையும் அவசரமாக எடுத்துக் கொள்ளுங்கள்." : "Treat that as urgent.",
    clear: ta
      ? "நீங்கள் BEFAST அறிகுறியைக் குறிக்கவில்லை. அதனால் பக்கவாதம் இல்லை என்று ஆகாது. ஏதாவது தவறாகத் தோன்றினால், போகும் முன் அழையுங்கள்."
      : "You did not mark a BEFAST sign. That does not rule out a stroke. If something still feels wrong, call the hospital before you go.",
    finding: ta ? "உங்களைத் தேடுகிறது…" : "Finding you…",
    tightening: ta ? "இடத்தைத் துல்லியமாக்குகிறது…" : "Tightening GPS…",
    updateLocation: ta ? "இடத்தைப் புதுப்பி" : "Update my location",
    findNearest: ta ? "எனக்கு அருகில் உள்ளதைக் காட்டு" : "Find nearest to me",
    cityCentre: ta ? "நகர மையம்" : "Use city centre",
    reset: ta ? "கடிகாரத்தையும் இடத்தையும் மீட்டமை" : "Reset clock and location",
    abroad: ta
      ? "வெளிநாட்டிலிருந்து உதவினால், அவர்கள் இருக்கும் பகுதியைத் தேர்ந்தெடுங்கள்"
      : "Helping from abroad? Set their area",
    abroadHint: ta ? "" : "வெளிநாட்டிலிருந்து உதவினால், சென்னையில் அவர்கள் இருக்கும் இடம்.",
    placePlaceholder: ta ? "அண்ணா நகர், வேளச்சேரி, ஆவடி…" : "Anna Nagar, Velachery, Avadi…",
    noArea: ta ? "அந்தப் பெயரில் பகுதி இல்லை. வரைபடத்தில் தொடுங்கள்." : "No area by that name. Tap the map instead.",
    hospitals(count: number) {
      return ta ? `${count} மருத்துவமனைகள்` : `${count} hospital${count === 1 ? "" : "s"}`;
    },
    sortedFrom(label: string | null, accuracy: string | null) {
      if (label) return ta ? `${label} இலிருந்து` : `from ${label}`;
      if (accuracy) return ta ? `உங்களிடமிருந்து, சுமார் ${accuracy}` : `from you, about ${accuracy}`;
      return ta ? "உங்களிடமிருந்து" : "from you";
    },
    fromCentre: ta ? "சென்னை மையத்திலிருந்து" : "from Chennai centre",
    sorted: ta ? "வரிசை" : "sorted",
    blocked: ta
      ? "இடம் தடுக்கப்பட்டுள்ளது. உலாவியில் இந்தத் தளத்துக்கு அனுமதி கொடுத்து, மீண்டும் தொடுங்கள்."
      : "Location is blocked. Allow it for this site in the browser, then tap again.",
    noFix: ta
      ? "இடம் கிடைக்கவில்லை. இருப்பிடத்தை இயக்கி, ஜன்னல் அருகே நின்று, மீண்டும் தொடுங்கள்."
      : "Couldn't get a fix. Turn location on, step nearer a window, and tap again.",
    noGeo: ta
      ? "இந்த உலாவி இடத்தைப் பகிராது. Chrome அல்லது Safari-யில் திறங்கள்."
      : "This browser can't share location. Open the link in Chrome or Safari.",
    loose(rounded: string) {
      return ta
        ? `துல்லியம் சுமார் ${rounded} மட்டும். முள் உங்கள் தெருவில் இல்லையென்றால், வரைபடத்தில் தொடுங்கள் அல்லது பகுதியைத் தேர்ந்தெடுங்கள்.`
        : `Only accurate to about ${rounded}. If the pin is not on your street, tap the map or set the area.`;
    },
    allTiers: ta ? "அனைத்தும்" : "All tiers",
    comprehensive: ta ? "த்ராம்பெக்டமி" : "Comprehensive",
    bothTypes: ta ? "அரசு + தனியார்" : "Gov + private",
    government: ta ? "அரசு" : "Government",
    private: ta ? "தனியார்" : "Private",
    legendGovComp: ta ? "அரசு · த்ராம்பெக்டமி" : "Gov comprehensive",
    legendPvtComp: ta ? "தனியார் · த்ராம்பெக்டமி" : "Private comprehensive",
    legendGovReady: ta ? "அரசு · பக்கவாத தயார்" : "Gov stroke-ready",
    legendPvtReady: ta ? "தனியார் · பக்கவாத தயார்" : "Private stroke-ready",
    tapMap: ta ? "அவர்கள் தெருவில் முள் வைக்க வரைபடத்தைத் தொடுங்கள்." : "Tap the map to drop a pin on their street.",
    nearest: ta ? "அருகிலுள்ள மருத்துவமனைகள்" : "Nearest hospitals",
    recheck: ta ? "அறிகுறிகளை மீண்டும் பார்க்க" : "Check signs again",
    explain: ta
      ? "த்ராம்பெக்டமி என்றால் இரத்தக் கட்டியை வெளியே எடுப்பது. “அழைத்துக் கேளுங்கள்” என்றால் அந்த வசதி தெளிவாகச் சொல்லப்படவில்லை."
      : "Thrombectomy means pulling the clot out. “Call to confirm” means that service is not clearly listed.",
    noMatch: ta ? "இந்த வடிகட்டலுக்கு மருத்துவமனை இல்லை." : "No hospitals match this filter.",
    disclaimer: ta ? "இந்தப் பக்கம் பக்கவாதத்தைக் கண்டறியாது" : "This app does not diagnose stroke",
    noAmbulance: ta ? "ஆம்புலன்ஸையும் அனுப்பாது." : "and does not dispatch an ambulance.",
    clocks: ta
      ? "பச்சைக் கடிகாரம் நீங்கள் போட்ட நேரத்திலிருந்து 4.5 மணி — இரத்தக் கட்டியைக் கரைக்கும் மருந்துக்கு பெரும்பாலும் சொல்லப்படும் நேரம். ஆரஞ்சுக் கடிகாரம் 9 மணி — சில மையங்கள் இன்னும் பார்க்கும் நேரம். பரிசோதனைக்கும் ஸ்கேனுக்கும் பிறகு மருத்துவக் குழுவே முடிவு செய்யும்."
      : "The green clock is 4.5 hours from the time you entered — a window often cited for clot-busting medicine. The orange clock is 9 hours — a later window some centres still assess. Only the hospital team can decide, after an exam and scans.",
    sources: ta
      ? "24/7 சிடி, எம்ஆர்ஐ, த்ராம்பெக்டமி பொதுப் பக்கங்களிலிருந்தோ மருத்துவர் பரிசீலனையிலிருந்தோ வந்தவை. இது அரசு சான்றிதழ் அல்ல. பணிக்கு யார் இருக்கிறார்கள் என்று அழைத்துக் கேளுங்கள்."
      : "24/7 CT, MRI, and thrombectomy come from public pages or a clinician review. They are not a government certificate. Call ahead — who is on duty can change.",
    ct: ta ? "24/7 சிடி" : "24/7 CT",
    mri: ta ? "24/7 எம்ஆர்ஐ" : "24/7 MRI",
    thrombectomy: ta ? "24/7 த்ராம்பெக்டமி" : "24/7 thrombectomy",
    reviewed: ta ? "மருத்துவர் சரிபார்த்தது" : "Clinician-reviewed",
    publicInfo: ta ? "பொதுத் தகவல்" : "Public information",
    call(phone: string) {
      return ta ? `அழை ${phone}` : `Call ${phone}`;
    },
    navigate: ta ? "வழி" : "Navigate",
    noNumber: ta ? "பொது எண் இல்லை" : "No public number",
    fromYou: ta ? "உங்களிடமிருந்து" : "from you",
    pinned: ta ? "குறித்த இடம்" : "Pinned spot",
    youAreHere: ta ? "நீங்கள் இங்கே" : "You are here",
    centre: ta ? "சென்னை மையம்" : "Chennai centre",
  };
}
