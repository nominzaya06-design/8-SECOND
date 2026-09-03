export function cleanText(value, maxLength = 500) {
    return String(value ?? "").trim().slice(0, maxLength);
}

export function validEmail(value) {
    const email = cleanText(value, 180).toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function positiveNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function positiveInteger(value, fallback = 0) {
    return Math.max(0, Math.floor(positiveNumber(value, fallback)));
}

export function stringArray(value, fallback = []) {
    if (!Array.isArray(value)) return fallback;
    const cleaned = value.map(item => cleanText(item, 80)).filter(Boolean);
    return cleaned.length ? cleaned : fallback;
}
