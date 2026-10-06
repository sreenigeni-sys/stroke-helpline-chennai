import type { Lang } from "@/components/stroke/session";

export function locatorCopy(lang: Lang | null) {
  const ta = lang === "ta";
  return {
    ta,
    possible(signs: string) {
      return ta ? `பக்கவாத அறிகுறி இருக்கலாம்: ${signs}.` : `Possible stroke signs: ${signs}.`;
    },
    travel: ta
      ? "உடனடி மருத்துவ உதவியைப் பெறுங்கள். உங்களுடன் ஒருவர் இருந்தால், அவர் அருகிலுள்ள மருத்துவமனைத் தகவலைப் பார்க்கலாம்."
      : "Seek emergency medical help now. If someone is with you, ask them to check nearby hospital information.",
    unsure(signs: string) {
      return ta ? `உறுதி இல்லை: ${signs}.` : `Not sure about: ${signs}.`;
    },
    treatUrgent: ta ? "அதையும் அவசரமாக எடுத்துக் கொள்ளுங்கள்." : "Treat that as urgent.",
    clear: ta
      ? "இந்த அறிகுறிகள் தெரியவில்லை என்பதால் பக்கவாதம் இல்லை என்று உறுதியாகாது. திடீர் மாற்றம் இருந்தால் உடனடி மருத்துவ உதவி பெறுங்கள்."
      : "Not seeing these signs does not rule out stroke. If something has changed suddenly, seek urgent medical help.",
    finding: ta ? "உங்களைத் தேடுகிறது…" : "Finding you…",
    tightening: ta ? "இடத்தைத் துல்லியமாக்குகிறது…" : "Tightening GPS…",
    updateLocation: ta ? "இடத்தைப் புதுப்பி" : "Update my location",
    findNearest: ta ? "எனக்கு அருகில் உள்ளதைக் காட்டு" : "Find nearest to me",
    cityCentre: ta ? "நகர மையம்" : "Use city centre",
    reset: "Reset clock and location",
    abroad: ta
      ? "வேறு ஒருவருக்காக என்றால், நோயாளியின் இடத்தைத் தேர்ந்தெடுங்கள்."
      : "If for someone else, choose the patient's location.",
    abroadHint: ta ? "" : "வேறு ஒருவருக்காக என்றால், நோயாளியின் இடத்தைத் தேர்ந்தெடுங்கள்.",
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
    sorted: ta ? "நேர்கோட்டுத் தொலைவு வரிசை (பயண நேரம் அல்ல)" : "sorted by straight-line distance (not drive time)",
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
    comprehensive: ta ? "பக்கவாத தயார்" : "Stroke-ready",
    strokeReady: ta ? "பக்கவாத வரம்பு சிகிச்சை" : "Stroke-limited care",
    bothTypes: ta ? "அரசு + தனியார்" : "Gov + private",
    government: ta ? "அரசு" : "Government",
    private: ta ? "தனியார்" : "Private",
    legendGovComp: ta ? "அரசு · பக்கவாத தயார்" : "Gov stroke-ready",
    legendPvtComp: ta ? "தனியார் · பக்கவாத தயார்" : "Private stroke-ready",
    legendGovReady: ta ? "அரசு · வரம்பு சிகிச்சை" : "Gov stroke-limited care",
    legendPvtReady: ta ? "தனியார் · வரம்பு சிகிச்சை" : "Private stroke-limited care",
    tapMap: ta ? "அவர்கள் தெருவில் முள் வைக்க வரைபடத்தைத் தொடுங்கள்." : "Tap the map to drop a pin on their street.",
    nearest: ta ? "சென்னையில் பக்கவாத சிகிச்சை மருத்துவமனைகள்" : "Stroke-care hospitals in Chennai",
    listView: ta ? "பட்டியல்" : "List",
    mapView: ta ? "வரைபடம்" : "Map",
    mapPrivacy: ta
      ? "சாலை வரைபடம் Esri-யிலிருந்து வரும். திறந்தால் பார்க்கும் பகுதி பகிரப்படலாம். முள்ளைத் தொட்டால் அந்த மருத்துவமனை திறக்கும்."
      : "Streets load from Esri, not the previous map service. Opening the map can share the area on screen. Tap a pin to open that hospital.",
    recheck: ta ? "அறிகுறிகளைப் பார்க்க" : "Check warning signs",
    explain: ta
      ? "சேவை விவரங்கள் பட்டியல் அல்லது பொதுத் தகவலிலிருந்து வந்தவை; இவை அரசு சான்றிதழோ, இப்போதைய ஏற்றுக்கொள்ளல் உறுதியோ அல்ல. தூரம் நேர்கோட்டில் அளக்கப்படுகிறது; சாலைப் பயண நேரம் அல்ல."
      : "Service details come from the existing list or public/provider information; they are not formal certification or live acceptance. Distance is straight-line, not road travel time.",
    noMatch: ta ? "இந்த வடிகட்டலுக்கு மருத்துவமனை இல்லை." : "No hospitals match this filter.",
    disclaimer: ta ? "இந்தப் பக்கம் பக்கவாதத்தைக் கண்டறியாது" : "This app does not diagnose stroke",
    noAmbulance: ta
      ? "ஆம்புலன்ஸையும் அனுப்பாது. தற்போதைய ஏற்றுக்கொள்ளல் உறுதியாக இல்லை; அவசர உதவி வழங்குநரின் வழிகாட்டுதலைப் பின்பற்றுங்கள்."
      : "and does not dispatch an ambulance. Current acceptance is not confirmed; follow emergency-response guidance.",
    clocks: ta
      ? "நேரக் கணிப்பை வைத்து மருத்துவமனையைத் தேர்ந்தெடுக்க வேண்டாம். தெரிந்தால், கடைசியாக இயல்பாக இருந்த நேரத்தை அவசரக் குழுவிடம் சொல்லுங்கள்; அழைப்பைத் தாமதிக்க வேண்டாம்."
      : "Do not use a countdown to choose a hospital. If known, tell the emergency team when the person was last known to be well; do not delay the call.",
    sources: ta
      ? "சேவை மற்றும் சரிபார்ப்பு தேதியைப் பார்க்கவும். ஒவ்வொரு கிளையின் தற்போதைய ஏற்றுக்கொள்ளல் தனியாக உறுதிப்படுத்தப்பட வேண்டும்."
      : "Check the source class and list date. Current acceptance must be confirmed separately for each branch.",
    ct: ta ? "24/7 சிடி" : "24/7 CT",
    mri: ta ? "24/7 எம்ஆர்ஐ" : "24/7 MRI",
    thrombectomy: ta ? "24/7 த்ராம்பெக்டமி" : "24/7 thrombectomy",
    reviewed: ta ? "மருத்துவர் சரிபார்த்தது" : "Clinician-reviewed",
    publicInfo: ta ? "பொதுத் தகவல்" : "Public information",
    call(phone: string) {
      if (phone === "108") return ta ? "108 ஆம்புலன்ஸை அழைக்கவும்" : "Call 108 ambulance";
      return ta ? "அழை" : "Call listed number";
    },
    navigate: ta ? "வழியைத் திற" : "Open directions",
    noNumber: ta ? "நேரடி எண் பட்டியலிடப்படவில்லை" : "No direct number listed",
    fromYou: ta ? "உங்களிடமிருந்து" : "from you",
    pinned: ta ? "குறித்த இடம்" : "Pinned spot",
    youAreHere: ta ? "நீங்கள் இங்கே" : "You are here",
    centre: ta ? "சென்னை மையம்" : "Chennai centre",
  };
}
