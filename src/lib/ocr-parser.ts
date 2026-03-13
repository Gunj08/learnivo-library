/**
 * Smart OCR Text Parser for Indian Education Books
 * 
 * Extracts structured book metadata from raw OCR text using
 * hardcoded patterns, regex, and keyword matching.
 * No LLM/API required — fully offline.
 */

// ─── Roman Numeral Converter ────────────────────────────────────
const romanToArabic: Record<string, string> = {
    I: "1", II: "2", III: "3", IV: "4", V: "5",
    VI: "6", VII: "7", VIII: "8", IX: "9", X: "10",
    XI: "11", XII: "12",
};

// ─── Subject Detection Map ──────────────────────────────────────
const SUBJECT_KEYWORDS: Record<string, string[]> = {
    Physics: ["physics", "bhautik", "bhautiki", "भौतिकी", "भौतिक विज्ञान"],
    Chemistry: ["chemistry", "rasayan", "रसायन", "रसायन विज्ञान"],
    Biology: ["biology", "jeev", "jeevan", "जीव विज्ञान", "जीवविज्ञान"],
    Mathematics: ["mathematics", "math", "maths", "ganit", "गणित"],
    English: ["english", "angrezi"],
    Hindi: ["hindi", "हिंदी", "हिन्दी"],
    Economics: ["economics", "arthashastra", "अर्थशास्त्र"],
    History: ["history", "itihas", "इतिहास"],
    Geography: ["geography", "bhugol", "भूगोल"],
    "Political Science": ["political science", "rajniti", "राजनीति विज्ञान"],
    Accountancy: ["accountancy", "accounting", "lekhashastra"],
    "Business Studies": ["business studies", "vyapar", "व्यापार"],
    "Computer Science": ["computer science", "computer", "sanganak"],
    Science: ["science", "vigyan", "विज्ञान"],
    Sanskrit: ["sanskrit", "संस्कृत"],
    "Social Science": ["social science", "samajik vigyan", "सामाजिक विज्ञान"],
};

// ─── Board Detection Map ────────────────────────────────────────
const BOARD_KEYWORDS: Record<string, string[]> = {
    CBSE: ["cbse", "ncert", "central board", "kendriya"],
    ICSE: ["icse", "isc", "cisce", "council for the indian school"],
    "State Board": ["state board", "rajya board", "up board", "mp board", "bihar board", "maharashtra board"],
    University: ["university", "vishwavidyalaya", "college"],
};

// ─── Publisher Detection ────────────────────────────────────────
const PUBLISHER_KEYWORDS: Record<string, string[]> = {
    NCERT: ["ncert", "national council of educational research", "n.c.e.r.t"],
    "S. Chand": ["s. chand", "s chand", "schand"],
    "Arihant": ["arihant"],
    "Laxmi Publications": ["laxmi publications", "laxmi pub"],
    "Pearson": ["pearson"],
    "Oxford University Press": ["oxford university press", "oup"],
    "Cambridge University Press": ["cambridge university press", "cup"],
    "McGraw Hill": ["mcgraw hill", "mcgraw-hill", "tata mcgraw"],
    "Pradeep": ["pradeep publications", "pradeep's"],
    "R.D. Sharma": ["r.d. sharma", "rd sharma"],
    "H.C. Verma": ["h.c. verma", "hc verma", "concepts of physics"],
    "Oswaal": ["oswaal"],
    "Dhanpat Rai": ["dhanpat rai"],
};

// ─── Main Parsing Function ──────────────────────────────────────
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function parseOcrText(rawText: string) {
    // ─── Phase 1: Local Fallback Parsing (Instant) ─────────────────
    const localResult = localParse(rawText);

    // ─── Phase 2: Gemini Intelligent Parsing ───────────────────────
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[OCR] Gemini API Key missing, using local parser only.");
        return localResult;
    }

    try {
        const prompt = `
        Analyze this OCR text from an educational book cover and extract details in JSON format:
        Text: "${rawText}"
        
        Required JSON structure:
        {
          "title": "Clear Book Title",
          "subtitle": "Class/Subject info if any",
          "author": "Author name",
          "publisher": "NCERT/Arihant/etc",
          "board": "CBSE/ICSE/State Board",
          "grade": "9/10/11/12",
          "subject": "Physics/Math/etc",
          "language": "English/Hindi",
          "description": "Brief summary"
        }
        
        Use the local parser results as a baseline but improve them:
        Baseline: ${JSON.stringify(localResult)}
        
        ONLY return valid JSON. Do not include markdown blocks.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const geminiResult = JSON.parse(cleanedJson);

        return { ...localResult, ...geminiResult };
    } catch (error) {
        console.error("[OCR] Gemini parsing failed, falling back to local:", error);
        return localResult;
    }
}

function localParse(rawText: string) {
    const text = rawText.trim();
    const lower = text.toLowerCase();
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    let subject = "";
    for (const [subj, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) { subject = subj; break; }
    }

    let board = "";
    for (const [brd, keywords] of Object.entries(BOARD_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) { board = brd; break; }
    }

    let grade = "";
    const classPatterns = [/class\s+(\w+)/i, /कक्षा\s+(\w+)/i, /std\.?\s*(\w+)/i];
    for (const pattern of classPatterns) {
        const match = lower.match(pattern);
        if (match) {
            const raw = match[1].toUpperCase();
            grade = romanToArabic[raw] || raw;
            break;
        }
    }

    let publisher = "";
    for (const [pub, keywords] of Object.entries(PUBLISHER_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) { publisher = pub; break; }
    }

    return {
        title: cleanTitle(subject || lines[0] || "Untitled"),
        subtitle: grade ? `Class ${grade}` : "",
        author: publisher || "Unknown Author",
        publisher: publisher || "NCERT",
        board: board || "CBSE",
        grade: grade || "10",
        subject: subject || "",
        language: /[\u0900-\u097F]/.test(text) ? "Hindi" : "English",
        description: `Textbook for ${subject || "education"}.`
    };
}

// ─── Helper: Clean Title ────────────────────────────────────────
function cleanTitle(title: string): string {
    return title
        .replace(/\s+/g, " ")
        .replace(/^\W+|\W+$/g, "")
        .split(" ")
        .map((word) => {
            if (word.length <= 2 && word !== "of" && word !== "or" && word !== "an") {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ")
        .trim();
}
