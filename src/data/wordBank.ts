import rawWordBank from './word_bank.json';
import { WordEntry } from '../types';

export const wordBank: WordEntry[] = rawWordBank.puzzles as WordEntry[];

if (__DEV__) {
  wordBank.forEach((entry) => {
    if (entry.answer.length !== 9 || entry.letters.length !== 9) {
      console.warn(
        `word_bank.json: entry id ${entry.id} ("${entry.answer}") is not 9 letters`
      );
    }
    const sortedAnswer = entry.answer.split('').sort().join('');
    const sortedLetters = entry.letters.split('').sort().join('');
    if (sortedAnswer !== sortedLetters) {
      console.warn(
        `word_bank.json: entry id ${entry.id} "letters" ("${entry.letters}") is not an anagram of "answer" ("${entry.answer}")`
      );
    }
  });
}
