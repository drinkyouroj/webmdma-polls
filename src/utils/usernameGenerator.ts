/**
 * Generates a fun, band-like username for new users
 */

const adjectives = [
  'Cosmic', 'Electric', 'Mystic', 'Neon', 'Velvet', 'Crimson', 'Midnight',
  'Golden', 'Silver', 'Crystal', 'Sonic', 'Lunar', 'Solar', 'Astral',
  'Quantum', 'Vibrant', 'Dreamy', 'Psychedelic', 'Radiant', 'Ethereal',
  'Glowing', 'Vivid', 'Surreal', 'Hypnotic', 'Melodic', 'Groovy'
];

const nouns = [
  'Phoenix', 'Dragon', 'Tiger', 'Panther', 'Wolf', 'Raven', 'Falcon',
  'Serpent', 'Dolphin', 'Jaguar', 'Cobra', 'Eagle', 'Hawk', 'Owl',
  'Horizon', 'Nebula', 'Galaxy', 'Comet', 'Star', 'Moon', 'Planet',
  'Ocean', 'Mountain', 'River', 'Forest', 'Desert', 'Meadow', 'Canyon'
];

export function generateUsername(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}`;
}