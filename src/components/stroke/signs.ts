import { Eye, Hand, MessageSquare, PersonStanding, Smile, type LucideIcon } from "lucide-react";

export type SignId = "B" | "E" | "F" | "A" | "S";

export type Sign = {
  id: SignId;
  word: string;
  wordTa: string;
  ask: string;
  askTa: string;
  help: string;
  helpTa: string;
  watch: string;
  watchTa: string;
  video: string;
  poster: string;
  icon: LucideIcon;
};

export const SIGNS: Sign[] = [
  {
    id: "B",
    word: "Balance",
    wordTa: "சமநிலை",
    ask: "Sudden trouble with balance, walking, or dizziness?",
    askTa: "திடீரென தடுமாற்றம், நடக்க முடியாமை, அல்லது தலைச்சுற்றல் இருக்கிறதா?",
    help: "A stumble, a lean to one side, or the room seeming to spin.",
    helpTa: "ஒரு பக்கம் சாய்வது, தள்ளாடுவது, அல்லது சுற்றுப்புறம் சுற்றுவது போல் தெரிதல்.",
    watch: "Watch for a sudden sway or reach for support.",
    watchTa: "திடீர் தள்ளாட்டம் அல்லது பிடிக்குத் தேடுவதைப் பாருங்கள்.",
    video: "/media/befast/balance.mp4",
    poster: "/media/befast/balance.jpg",
    icon: PersonStanding,
  },
  {
    id: "E",
    word: "Eyes",
    wordTa: "பார்வை",
    ask: "Sudden trouble seeing in one or both eyes?",
    askTa: "திடீரென ஒன்று அல்லது இரண்டு கண்களிலும் பார்க்க முடியவில்லையா?",
    help: "Blur, double vision, or a dark patch that was not there a moment ago.",
    helpTa: "மங்கல், இரட்டைப் பார்வை, அல்லது புதிதாக ஒரு இருட்டுத் திட்டு.",
    watch: "Watch for someone covering an eye or saying the room went unclear.",
    watchTa: "ஒரு கண்ணை மூடுவதையோ, தெரியவில்லை என்று சொல்வதையோ பாருங்கள்.",
    video: "/media/befast/eyes.mp4",
    poster: "/media/befast/eyes.jpg",
    icon: Eye,
  },
  {
    id: "F",
    word: "Face",
    wordTa: "முகம்",
    ask: "Ask for a smile. Does one side of the face droop?",
    askTa: "சிரிக்கச் சொல்லுங்கள். முகத்தின் ஒரு பக்கம் தொங்குகிறதா?",
    help: "One corner of the mouth stays down, or one eyelid hangs.",
    helpTa: "வாயின் ஒரு மூலை இறங்கியிருக்கும், அல்லது ஒரு இமை தொங்கும்.",
    watch: "One side of the smile does not lift.",
    watchTa: "சிரிப்பின் ஒரு பக்கம் மட்டும் உயராது.",
    video: "",
    poster: "/media/befast/face.jpg",
    icon: Smile,
  },
  {
    id: "A",
    word: "Arm",
    wordTa: "கை",
    ask: "Ask them to lift both arms. Does one arm drift down?",
    askTa: "இரண்டு கைகளையும் தூக்கச் சொல்லுங்கள். ஒரு கை கீழே இறங்குகிறதா?",
    help: "They cannot hold one arm up, or it feels suddenly heavy.",
    helpTa: "ஒரு கையை மேலே வைத்திருக்க முடியவில்லை, அல்லது திடீரென கனமாக உள்ளது.",
    watch: "One arm stays up. The other sinks.",
    watchTa: "ஒரு கை மேலே இருக்கும். மற்றது இறங்கும்.",
    video: "/media/befast/arms.mp4",
    poster: "/media/befast/arms.jpg",
    icon: Hand,
  },
  {
    id: "S",
    word: "Speech",
    wordTa: "பேச்சு",
    ask: "Is speech suddenly slurred, strange, or hard to get out?",
    askTa: "பேச்சு திடீரென குழறுகிறதா, வித்தியாசமாக இருக்கிறதா, அல்லது வரவில்லையா?",
    help: "Ask them to repeat: “The sky is blue.”",
    helpTa: "இதைத் திரும்பச் சொல்லச் சொல்லுங்கள்: “வானம் நீலம்.”",
    watch: "The words will not come out clearly.",
    watchTa: "சொற்கள் தெளிவாக வராது.",
    video: "/media/befast/speech.mp4",
    poster: "/media/befast/speech.jpg",
    icon: MessageSquare,
  },
];
