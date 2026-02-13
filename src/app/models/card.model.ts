export interface Card {
    id?: number;
    side: string;
    faction: string;
    kind: string;
    uniqueCard: boolean;
    name: string;
    subtitle: string;
    price: number;
    strength: number;
    influence: number;
    mu: number;
    type: string;
    text: string;
    fluff: string;
    link: number;
    minDeck: number;
    maxInfluence: number;
    imageData: string;
}
