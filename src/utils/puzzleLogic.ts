export interface Tile {
  letter: string;
  used: boolean;
}

export interface GuessSlot {
  letter: string | null;
  tileIndex: number | null;
  hinted: boolean;
}

export function createTiles(letters: string[]): Tile[] {
  return letters.map((letter) => ({ letter, used: false }));
}

export function createEmptySlots(count: number): GuessSlot[] {
  return Array.from({ length: count }, () => ({
    letter: null,
    tileIndex: null,
    hinted: false,
  }));
}

function firstEmptySlotIndex(slots: GuessSlot[]): number {
  return slots.findIndex((slot) => slot.letter === null);
}

// Places `tileIndex` into the next empty slot. Returns null if the tile is
// already used or the row is full.
export function placeTile(
  tiles: Tile[],
  slots: GuessSlot[],
  tileIndex: number
): { tiles: Tile[]; slots: GuessSlot[] } | null {
  if (tiles[tileIndex].used) return null;
  const slotIndex = firstEmptySlotIndex(slots);
  if (slotIndex === -1) return null;

  const nextTiles = tiles.map((tile, i) => (i === tileIndex ? { ...tile, used: true } : tile));
  const nextSlots = slots.map((slot, i) =>
    i === slotIndex ? { letter: tiles[tileIndex].letter, tileIndex, hinted: false } : slot
  );
  return { tiles: nextTiles, slots: nextSlots };
}

// Removes the right-most filled slot, unless it's a locked hint.
export function removeLastTile(
  tiles: Tile[],
  slots: GuessSlot[]
): { tiles: Tile[]; slots: GuessSlot[] } | null {
  let lastIndex = -1;
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].letter !== null) {
      lastIndex = i;
      break;
    }
  }
  if (lastIndex === -1) return null;
  const slot = slots[lastIndex];
  if (slot.hinted) return null;

  const nextTiles =
    slot.tileIndex !== null
      ? tiles.map((tile, i) => (i === slot.tileIndex ? { ...tile, used: false } : tile))
      : tiles;
  const nextSlots = slots.map((s, i) =>
    i === lastIndex ? { letter: null, tileIndex: null, hinted: false } : s
  );
  return { tiles: nextTiles, slots: nextSlots };
}

// Reveals the correct letter for the first slot (left to right) that isn't
// already correctly filled. Pulls a matching unused tile from the pool if
// one is available; if every copy of that letter is already placed
// elsewhere (duplicate-letter words), it reclaims one sitting at a slot
// where it's actually the wrong letter, since a spare must exist there.
export function applyHint(
  tiles: Tile[],
  slots: GuessSlot[],
  answer: string
): { tiles: Tile[]; slots: GuessSlot[] } | null {
  const targetIndex = slots.findIndex((slot, i) => slot.letter !== answer[i]);
  if (targetIndex === -1) return null;

  const correctLetter = answer[targetIndex];
  const existingSlot = slots[targetIndex];
  let nextSlots = [...slots];

  // Free whatever tile currently sits in the target slot (if any) before
  // choosing a replacement, since it was placed at the wrong position.
  let nextTiles =
    existingSlot.tileIndex !== null
      ? tiles.map((tile, i) => (i === existingSlot.tileIndex ? { ...tile, used: false } : tile))
      : tiles;
  nextSlots[targetIndex] = { letter: null, tileIndex: null, hinted: false };

  let chosenTileIndex = nextTiles.findIndex((tile) => !tile.used && tile.letter === correctLetter);

  if (chosenTileIndex === -1) {
    // Every tile of this letter is already placed. Some other slot must be
    // holding one at a position it doesn't belong (this one's is spoken
    // for by definition of targetIndex) - reclaim it.
    const wrongSlotIndex = nextSlots.findIndex(
      (slot, i) => i !== targetIndex && slot.letter === correctLetter && slot.letter !== answer[i]
    );
    if (wrongSlotIndex !== -1) {
      // A filled, non-hinted slot always has a real tileIndex.
      const reclaimedTileIndex = nextSlots[wrongSlotIndex].tileIndex ?? -1;
      nextSlots[wrongSlotIndex] = { letter: null, tileIndex: null, hinted: false };
      chosenTileIndex = reclaimedTileIndex;
    }
  }

  nextTiles = nextTiles.map((tile, i) =>
    i === chosenTileIndex ? { ...tile, used: true } : tile
  );

  nextSlots[targetIndex] = {
    letter: correctLetter,
    tileIndex: chosenTileIndex === -1 ? null : chosenTileIndex,
    hinted: true,
  };

  return { tiles: nextTiles, slots: nextSlots };
}

export function isRowFull(slots: GuessSlot[]): boolean {
  return slots.every((slot) => slot.letter !== null);
}

export function guessWord(slots: GuessSlot[]): string {
  return slots.map((slot) => slot.letter ?? '').join('');
}

export function countHintedSlots(slots: GuessSlot[]): number {
  return slots.filter((slot) => slot.hinted).length;
}
