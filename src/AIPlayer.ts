var Strategy = {
    PASSIVE: 0,
    NORMAL: 1,
    TRICKY: 2,
    AGGRESSIVE: 3
}

var AIController = function (player, style) {
    var player;
    var callbackFunction;
    let hand = [];
    let board = [];
    let strategy = style;

    var betAggressive = function (cards, board, currentBet, committed, minRaise, money, potCheck) {

        let deck = new Deck();

        let totalLosses = 0;
        let totalWins = 0;
        let totalDraws = 0;

        let trials = 30;

        for (let i = 0; i < trials; ++i) {
            deck.shuffle();
            let possibleDraws = Hands.difference(deck.getCards(), cards.concat(board));
            let possibleBoard = board;
            while (possibleBoard.length < 5) {
                possibleBoard.push(possibleDraws.pop());
            }

            let possibleHand = cards.concat(possibleBoard);

            let hypotheticalHand = [possibleDraws.pop(), possibleDraws.pop()];

            let hypotheticalResult = Hands.bestHand(hypotheticalHand.concat(possibleBoard));
            let bestHand = Hands.bestHand(possibleHand);

            if (bestHand.score > hypotheticalResult.score) {
                ++totalWins;
            } else if (bestHand.score === hypotheticalResult.score) {
                ++totalDraws;
            } else {
                ++totalLosses;
            }
        }

        let winRatio = totalWins / trials;
        let lossRatio = totalLosses / trials;

        let toCall = currentBet - committed;
        let toRaise = currentBet - committed + minRaise;

        let potOdds = toCall / potCheck(player, toCall);

        if (lossRatio === 0) {
            if (money > toCall) {
                return new Bet(BetType.RAISE, money);
            } else {
                return new Bet(BetType.CALL);
            }
        }

        if (toCall === 0) {
            if (winRatio <= 0.5) {
                return new Bet(BetType.CHECK);
            } else {
                if (money >= toRaise) {
                    let raise = toRaise * 8;
                    while (raise >= toRaise) {
                        if (money >= raise * 2 && raise / potCheck(player, raise) * 3 <= winRatio) {
                            return new Bet(BetType.RAISE, raise);
                        }
                        raise /= 2;
                    }
                    return new Bet(BetType.RAISE, toRaise);
                } else {
                    return new Bet(BetType.CHECK);
                }
            }
        } else {
            if (winRatio <= 0.5) {
                if (potOdds * 2 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else if (winRatio <= 0.8) {
                if (potOdds * 2 <= winRatio) {
                    if (money >= toRaise) {
                        let raise = toRaise * 8;
                        while (raise >= toRaise) {
                            if (money >= raise * 2 && raise / potCheck(player, raise) * 2 <= winRatio) {
                                return new Bet(BetType.RAISE, raise);
                            }
                            raise /= 2;
                        }
                        return new Bet(BetType.RAISE, toRaise);
                    } else {
                        return new Bet(BetType.CALL);
                    }
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else {
                if (potOdds * 2 <= winRatio) {
                    if (money >= toRaise) {
                        let raise = toRaise * 16;
                        while (raise >= toRaise) {
                            if (money >= raise && raise / potCheck(player, raise) * 1.5 <= winRatio) {
                                return new Bet(BetType.RAISE, raise);
                            }
                            raise /= 2;
                        }
                        return new Bet(BetType.RAISE, toRaise);
                    } else {
                        return new Bet(BetType.CALL);
                    }
                } else {
                    return new Bet(BetType.CALL);
                }
            }
        }
    }

    var betTricky = function (cards, board, currentBet, committed, minRaise, money, potCheck) {

        let deck = new Deck();

        let totalLosses = 0;
        let totalWins = 0;
        let totalDraws = 0;

        let trials = 20;

        for (let i = 0; i < trials; ++i) {
            deck.shuffle();
            let possibleDraws = Hands.difference(deck.getCards(), cards.concat(board));
            let possibleBoard = board;
            while (possibleBoard.length < 5) {
                possibleBoard.push(possibleDraws.pop());
            }

            let possibleHand = cards.concat(possibleBoard);

            let hypotheticalHand = [possibleDraws.pop(), possibleDraws.pop()];

            let hypotheticalResult = Hands.bestHand(hypotheticalHand.concat(possibleBoard));
            let bestHand = Hands.bestHand(possibleHand);

            if (bestHand.score > hypotheticalResult.score) {
                ++totalWins;
            } else if (bestHand.score === hypotheticalResult.score) {
                ++totalDraws;
            } else {
                ++totalLosses;
            }
        }

        let winRatio = totalWins / trials;
        let lossRatio = totalLosses / trials;

        let toCall = currentBet - committed;
        let toRaise = currentBet - committed + minRaise;

        let potOdds = toCall / potCheck(player, toCall);

        if (lossRatio === 0) {
            if (money > toCall) {
                return new Bet(BetType.RAISE, money);
            } else {
                return new Bet(BetType.CALL);
            }
        }

        if (toCall === 0) {
            if (winRatio <= 0.5) {
                return new Bet(BetType.CHECK);
            } else {
                if (money >= toRaise) {
                    let raise = toRaise * 8;
                    while (raise >= toRaise) {
                        if (money >= raise * 3 && raise / potCheck(player, raise) * 3 <= winRatio) {
                            return new Bet(BetType.RAISE, raise);
                        }
                        raise /= 2;
                    }
                    return new Bet(BetType.RAISE, toRaise);
                } else {
                    return new Bet(BetType.CHECK);
                }
            }
        } else {
            if (winRatio <= 0.5) {
                if (potOdds * 1.5 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else if (winRatio <= 0.8) {
                if (potOdds * 2 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else {
                if (potOdds * 2 <= winRatio) {
                    if (money >= toRaise) {
                        let raise = toRaise * 8;
                        while (raise >= toRaise) {
                            if (money >= raise && raise / potCheck(player, raise) * 2 <= winRatio) {
                                return new Bet(BetType.RAISE, raise);
                            }
                            raise /= 2;
                        }
                        return new Bet(BetType.RAISE, toRaise);
                    } else {
                        return new Bet(BetType.CALL);
                    }
                } else {
                    return new Bet(BetType.CALL);
                }
            }
        }
    }

    var betNormal = function (cards, board, currentBet, committed, minRaise, money, potCheck) {

        let deck = new Deck();

        let totalLosses = 0;
        let totalWins = 0;
        let totalDraws = 0;

        let trials = 30;

        for (let i = 0; i < trials; ++i) {
            deck.shuffle();
            let possibleDraws = Hands.difference(deck.getCards(), cards.concat(board));
            let possibleBoard = board;
            while (possibleBoard.length < 5) {
                possibleBoard.push(possibleDraws.pop());
            }

            let possibleHand = cards.concat(possibleBoard);

            let hypotheticalHand = [possibleDraws.pop(), possibleDraws.pop()];

            let hypotheticalResult = Hands.bestHand(hypotheticalHand.concat(possibleBoard));
            let bestHand = Hands.bestHand(possibleHand);

            if (bestHand.score > hypotheticalResult.score) {
                ++totalWins;
            } else if (bestHand.score === hypotheticalResult.score) {
                ++totalDraws;
            } else {
                ++totalLosses;
            }
        }

        let winRatio = totalWins / trials;
        let lossRatio = totalLosses / trials;

        let toCall = currentBet - committed;
        let toRaise = currentBet - committed + minRaise;

        let potOdds = toCall / potCheck(player, toCall);

        if (winRatio === 1) {
            if (money > toCall) {
                return new Bet(BetType.RAISE, money);
            } else {
                return new Bet(BetType.CALL);
            }
        }

        if (toCall === 0) {
            if (winRatio <= 0.6) {
                return new Bet(BetType.CHECK);
            } else {
                if (money >= toRaise) {
                    let raise = toRaise * 4;
                    while (raise >= toRaise) {
                        if (money >= raise * 4 && raise / potCheck(player, raise) * 3 <= winRatio) {
                            return new Bet(BetType.RAISE, raise);
                        }
                        raise /= 2;
                    }
                    return new Bet(BetType.RAISE, toRaise);
                } else {
                    return new Bet(BetType.CHECK);
                }
            }
        } else {
            if (winRatio <= 0.5) {
                if (potOdds * 3 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else if (winRatio <= 0.8) {
                if (potOdds * 2.5 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else {
                if (potOdds * 2 <= winRatio) {
                    if (money >= toRaise) {
                        let raise = toRaise * 8;
                        while (raise >= toRaise) {
                            if (money >= raise * 2 && raise / potCheck(player, raise) * 1.5 <= winRatio) {
                                return new Bet(BetType.RAISE, raise);
                            }
                            raise /= 2;
                        }
                        return new Bet(BetType.RAISE, toRaise);
                    } else {
                        return new Bet(BetType.CALL);
                    }
                } else {
                    return new Bet(BetType.CALL);
                }
            }
        }
    }

    var betPassive = function (cards, board, currentBet, committed, minRaise, money, potCheck) {

        let deck = new Deck();

        let totalLosses = 0;
        let totalWins = 0;
        let totalDraws = 0;

        let trials = 30;

        for (let i = 0; i < trials; ++i) {
            deck.shuffle();
            let possibleDraws = Hands.difference(deck.getCards(), cards.concat(board));
            let possibleBoard = board;
            while (possibleBoard.length < 5) {
                possibleBoard.push(possibleDraws.pop());
            }

            let possibleHand = cards.concat(possibleBoard);

            let hypotheticalHand = [possibleDraws.pop(), possibleDraws.pop()];

            let hypotheticalResult = Hands.bestHand(hypotheticalHand.concat(possibleBoard));
            let bestHand = Hands.bestHand(possibleHand);

            if (bestHand.score > hypotheticalResult.score) {
                ++totalWins;
            } else if (bestHand.score === hypotheticalResult.score) {
                ++totalDraws;
            } else {
                ++totalLosses;
            }
        }

        let winRatio = totalWins / trials;
        let lossRatio = totalLosses / trials;

        let toCall = currentBet - committed;
        let toRaise = currentBet - committed + minRaise;

        let potOdds = toCall / potCheck(player, toCall);

        if (winRatio === 1) {
            if (money > toCall) {
                return new Bet(BetType.RAISE, money);
            } else {
                return new Bet(BetType.CALL);
            }
        }

        if (toCall === 0) {
            if (winRatio <= 0.7) {
                return new Bet(BetType.CHECK);
            } else {
                if (money >= toRaise) {
                    let raise = toRaise * 4;
                    while (raise >= toRaise) {
                        if (money >= raise * 4 && raise / potCheck(player, raise) * 3 <= winRatio) {
                            return new Bet(BetType.RAISE, raise);
                        }
                        raise /= 2;
                    }
                    return new Bet(BetType.RAISE, toRaise);
                } else {
                    return new Bet(BetType.CHECK);
                }
            }
        } else {
            if (winRatio <= 0.5) {
                if (potOdds * 3 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else if (winRatio <= 0.8) {
                if (potOdds * 3 <= winRatio) {
                    return new Bet(BetType.CALL);
                } else {
                    return new Bet(BetType.FOLD);
                }
            } else {
                if (potOdds * 2.5 <= winRatio) {
                    if (money >= toRaise) {
                        let raise = toRaise * 8;
                        while (raise >= toRaise) {
                            if (money >= raise * 2 && raise / potCheck(player, raise) * 2 <= winRatio) {
                                return new Bet(BetType.RAISE, raise);
                            }
                            raise /= 2;
                        }
                        return new Bet(BetType.RAISE, toRaise);
                    } else {
                        return new Bet(BetType.CALL);
                    }
                } else {
                    return new Bet(BetType.CALL);
                }
            }
        }
    }

    //Allows game to notify player of events
    this.dispatchEvent = function (e) {
        if (e instanceof GameStartEvent) {
            board = [];
        } else if (e instanceof DealtHandEvent) {
            hand = e.hand;
        } else if (e instanceof DealtFlopEvent || e instanceof DealtTurnEvent || e instanceof DealtRiverEvent) {
            board = board.concat(e.cards);
        } else if (e instanceof BetAwaitEvent) {

            if (e.player === player) {

                let bet = null;

                switch (strategy) {
                    case Strategy.NORMAL:
                        bet = betNormal(hand, board, e.current, e.committed, e.minRaise, player.getMoney(), e.potCheck);
                        break;

                    case Strategy.PASSIVE:
                        bet = betPassive(hand, board, e.current, e.committed, e.minRaise, player.getMoney(), e.potCheck);
                        break;

                    case Strategy.TRICKY:
                        bet = betTricky(hand, board, e.current, e.committed, e.minRaise, player.getMoney(), e.potCheck);
                        break;

                    case Strategy.AGGRESSIVE:
                        bet = betAggressive(hand, board, e.current, e.committed, e.minRaise, player.getMoney(), e.potCheck);
                        break;

                }

                e.callback(player, bet);

            }

        }

    }

}