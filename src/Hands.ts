import { Rank } from "./Rank";
import { Suit } from "./Suit";
import { Card } from "./Card";

enum HandCombinations {
    HighCard,
    OnePair,
    TwoPair,
    ThreeOfAKind,
    Straight,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush
}

export class Hands {

    public static difference(set: any[], subset: any[]): any[] {
        let result = set.slice(0);
        for (let item of subset) {
            result.splice(result.indexOf(item), 1);
        }
        return result;
    }

    static sort(cards: Card[], isAceLow?: boolean): Card[] {
        let results: Card[] = cards.slice(0);
        if (isAceLow === true) {
            results.sort(function (a, b) {
                return a.rank.valueAceLow() - b.rank.valueAceLow();
            });
        } else {
            results.sort(function (a, b) {
                return a.rank.value() - b.rank.value();
            });
        }
        return results;
    }

    static sortBySuit(cards: Card[]): Card[] {
        let results = cards.slice(0);
        results.sort(function (a, b) {
            if (a.suit > b.suit) {
                return 1;
            } else {
                return -1;
            }
        });
        return results;
    }

    static getHighestCard(cards: Card[]): Card {
        return this.sort(cards)[cards.length - 1];
    }

    static getNHighestCards(cards: Card[], n: number): Card[] {
        let sorted: Card[] = this.sort(cards);
        let result: Card[] = [];
        while (result.length < n) {
            result.push(sorted.pop());
        }
        return result;
    }

    static groupByRank(cards: Card[]) {
        let results = [];
        let sorted = this.sort(cards);
        let currentIndex: number = 0;
        for (let i in sorted) {
            if (results[currentIndex] === undefined) {
                results[currentIndex] = [];
                results[currentIndex].push(sorted[i]);
            } else {
                if (results[currentIndex][0].rank === sorted[i].rank) {
                    results[currentIndex].push(sorted[i]);
                } else {
                    results[++currentIndex] = [sorted[i]];
                }
            }
        }
        results.sort(function (a, b) {
            return b.length - a.length;
        });
        return results;
    }

    static groupBySuit(cards: Card[]) {
        let results = [];
        cards = this.sortBySuit(cards);
        let currentIndex: number = 0;
        for (let i in cards) {
            if (results[currentIndex] === undefined) {
                results[currentIndex] = [];
                results[currentIndex].push(cards[i]);
            } else {
                if (results[currentIndex][0].suit === cards[i].suit) {
                    results[currentIndex].push(cards[i]);
                } else {
                    ++currentIndex;
                    results[currentIndex] = [cards[i]];
                }
            }
        }
        results.sort(function (a, b) {
            return b.length - a.length;
        });
        return results;
    }

    static getScore(cards: Card[]): number {
        let score: number = 0;
        for (let i = 0; i < cards.length; ++i) {
            score += cards[i].rank.value() * Math.pow(14, cards.length - i - 1);
        }
        return score;
    }

    static longestSequence(cards: Card[]): Card[] { //longest sequence of cards (including A low/high) with 5+ cards
        let sorted: Card[] = this.sort(cards);
        let hand: Card[] = [];
        let currentRank: number;

        for (let card of sorted) {
            if (currentRank === undefined || currentRank === null) {
                currentRank = card.rank.value();
                hand.push(card);
            } else {
                if (card.rank.value() === currentRank) {
                    continue;
                } else if (card.rank.value() === currentRank + 1) {
                    currentRank = card.rank.value();
                    hand.push(card);
                } else {
                    if (hand.length >= 5) {
                        return hand;
                    } else {
                        currentRank = card.rank.value();
                        hand = [card];
                    }
                }
            }
        }
        if (hand.length >= 5) {
            // Consistency - don't want to return sequences of <5 cards
            return hand;
        }
        hand = [];
        sorted = this.sort(cards, true);
        currentRank = null;
        for (let card of sorted) {
            if (currentRank === undefined || currentRank === null) {
                currentRank = card.rank.valueAceLow();
                hand.push(card);
            } else {
                if (card.rank.valueAceLow() === currentRank) {
                    continue;
                } else if (card.rank.valueAceLow() === currentRank + 1) {
                    currentRank = card.rank.valueAceLow();
                    hand.push(card);
                } else {
                    if (hand.length >= 5) {
                        return hand;
                    } else {
                        currentRank = card.rank.valueAceLow();
                        hand = [card];
                    }
                }
            }
        }
        if (hand.length >= 5) {
            // Consistency - don't want to return sequences of <5 sorted
            return hand;
        } else {
            return [];
        }
    }

    public static bestHand(cards: Card[]) {
        let hand: Card[] = [];
        let score: number;

        let mostCommonSuits = this.groupBySuit(cards);
        let largestSuit = mostCommonSuits[0];
        let mostCommonRanks = this.groupByRank(cards);
        let longestStraight = this.longestSequence(cards);

        if (largestSuit.length >= 5) { // Straight flush
            let ls = this.longestSequence(mostCommonSuits[0]);
            if (ls.length >= 5) {
                let highestCard: Card = this.getHighestCard(ls);
                let secondHighestCard: Card = this.getHighestCard(this.difference(ls, [highestCard]));
                if (highestCard.rank === Rank.Ace && secondHighestCard.rank !== Rank.King) {
                    ls = this.sort(ls, true);
                    hand = ls.slice(-5);
                    score = 8 * Math.pow(14, 5) + secondHighestCard.rank.value();
                } else {
                    hand = this.getNHighestCards(ls, 5);
                    score = 8 * Math.pow(14, 5) + highestCard.rank.value();
                }
                return {
                    hand: hand,
                    score: score,
                    type: HandCombinations.StraightFlush
                };
            }
        }

        if (mostCommonRanks[0].length === 4) { // Four of a kind
            let quad: Card[] = mostCommonRanks[0];
            let kicker: Card[] = this.getNHighestCards(this.difference(cards, quad), 1);
            hand = quad.concat(kicker);
            score = 7 * Math.pow(14, 5) + quad[0].rank.value() * 14 + kicker[0].rank.value();
            return {
                hand: hand,
                score: score,
                type: HandCombinations.FourOfAKind
            };
        } else if (mostCommonRanks[0].length === 3 && mostCommonRanks[1].length >= 2) { // Full house
            let triple: Card[] = mostCommonRanks[0];
            let pair: Card[];
            if (mostCommonRanks[2].length === 2 && mostCommonRanks[2][0].rank.value() > mostCommonRanks[1][0].rank.value()) {
                pair = mostCommonRanks[2];
            } else {
                pair = mostCommonRanks[1].slice(0, 2);
            }
            hand = triple.concat(pair);
            score = 6 * Math.pow(14, 5) + triple[0].rank.value() * 14 + pair[0].rank.value();
            return {
                hand: hand,
                score: score,
                type: HandCombinations.FullHouse
            };
        } else if (largestSuit.length >= 5) { // Flush
            hand = this.getNHighestCards(largestSuit, 5);
            score = 5 * Math.pow(14, 5) + this.getScore(hand);
            return {
                hand: hand,
                score: score,
                type: HandCombinations.Flush
            };
        } else if (longestStraight.length >= 5) { // Straight
            let highestCard = this.getHighestCard(longestStraight);
            let secondHighestCard = this.getHighestCard(this.difference(longestStraight, [highestCard]));
            if (highestCard.rank === Rank.Ace && secondHighestCard.rank !== Rank.King) {
                longestStraight = this.sort(longestStraight, true);
                hand = longestStraight.slice(-5);
                score = 4 * Math.pow(14, 5) + secondHighestCard.rank.value();
            } else {
                hand = this.getNHighestCards(longestStraight, 5);
                score = 4 * Math.pow(14, 5) + highestCard.rank.value();
            }
            return {
                hand: hand,
                score: score,
                type: HandCombinations.Straight
            };
        } else if (mostCommonRanks[0].length === 3) { // Three of a kind
            let triple = mostCommonRanks[0];
            let kickers = this.getNHighestCards(this.difference(cards, triple), 2);
            hand = triple.concat(kickers);
            score = 3 * Math.pow(14, 5) + triple[0].rank.value() * Math.pow(14, 3) + this.getScore(kickers);
            return {
                hand: hand,
                score: score,
                type: HandCombinations.ThreeOfAKind
            };
        } else if (mostCommonRanks[0].length === 2 && mostCommonRanks[1].length === 2) { // Two pair
            let highPair;
            let lowPair;
            if (mostCommonRanks[2].length === 2) {
                // Check which 2 pairs are highest
                highPair = mostCommonRanks[2];
                lowPair = mostCommonRanks[1];
            } else {
                highPair = mostCommonRanks[1];
                lowPair = mostCommonRanks[0];
            }
            hand = highPair.concat(lowPair);
            let remainder = this.difference(cards, hand);
            let kicker = this.getHighestCard(remainder)
            hand.push(kicker);
            score = 2 * Math.pow(14, 5) + highPair[0].rank.value() * Math.pow(14, 2) + lowPair[0].rank.value() * Math.pow(14, 1) + kicker.rank.value();
            return {
                hand: hand,
                score: score,
                type: HandCombinations.TwoPair
            };
        } else if (mostCommonRanks[0].length === 2) { // One pair
            let pair = mostCommonRanks[0];
            let kickers = this.getNHighestCards(this.difference(cards, pair), 3);
            hand = pair.concat(kickers);
            score = Math.pow(14, 5) + pair[0].rank.value() * Math.pow(14, 3) + this.getScore(kickers);
            return {
                hand: hand,
                score: score,
                type: HandCombinations.OnePair
            };
        } else { // High card
            hand = this.getNHighestCards(cards, 5);
            score = this.getScore(hand);
            return {
                hand: hand,
                score: score,
                type: HandCombinations.HighCard
            };
        }
    }

}