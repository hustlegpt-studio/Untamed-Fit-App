export const START_PHRASES = [
  "ready",
  "yes",
  "let's start",
  "let's go",
  "i'm ready",
  "start",
  "begin",
  "let's do this",
  "go",
  "let's begin",
  "alright",
  "okay"
];

export const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind that you need to convince.",
  "Success isn't final, failure isn't fatal: it's the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Dream bigger. Work harder. Stay focused.",
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  "Champions aren't made in gyms. Champions are made from something they have deep inside them—a desire, a dream, a vision.",
  "Do something today that your future self will thank you for.",
  "Be yourself; everyone else is already taken."
];

export function isStartPhrase(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return START_PHRASES.some(phrase => normalized.includes(phrase));
}

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}
