import rawWordBank from './word_bank.json';
import { WordEntry } from '../types';

export const wordBank: WordEntry[] = rawWordBank.words;

if (__DEV__) {
  wordBank.forEach((entry) => {
    if (entry.word.length !== 9) {
      console.warn(
        `word_bank.json: entry id ${entry.id} ("${entry.word}") is not 9 letters`
      );
    }
  });
}
