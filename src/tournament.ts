import { BracketMode } from './bracket-mode';
import { Match, Team } from './model';

class Tournament extends BracketMode {
  private tournamentWinner: Team | null = null;
  private matchCounter: number = 0;

  constructor() {
    super('Tournament');
  }

  get isContinous(): boolean {
    return false;
  }
  eliminatesTeam(): boolean {
    return true;
  }
  createBracket() {
    this.startTournament();
  }

  public static from(t: Tournament): BracketMode {
    const tournament: Tournament = new Tournament();
    tournament.setProperties(t as BracketMode);
    tournament.tournamentWinner = t.tournamentWinner;
    tournament.matchCounter = t.matchCounter;
    return tournament;
  }

  isOver(): boolean {
    return this.tournamentOver;
  }

  win(match: Match, winner: Team, canDraw: boolean): void {
    super.win(match, winner, canDraw);
    if (this.matches.length === 1) {
      this.tournamentWinner = winner;
      this.endTournament();
    }
  }

  public get winner(): Team | null {
    return this.tournamentWinner;
  }

  nextRound(): void {
    if (this.isOver()) {
      console.log('tournament is over, winner is', this.tournamentWinner);
      this.matches.splice(0);
      return;
    }

    if (this.matches.length === 0) {
      // first round -> create tournament bracket
      this.createTournamentBracket();
      return;
    }

    const teams: Team[] = [];
    for (const m of this.matches) {
      if (!m.winner) {
        throw new Error(`Winner of match ${m} not yet set!`);
      }

      teams.push(m.winner);
    }

    this.matches.splice(0);
    for (let i = 0; i < teams.length; i += 2) {
      this.matches.push(new Match(teams[i], teams[i + 1], this.matchCounter++));
    }

    if (this.matches.length === 1 && !this.matches[0].getTeams()[1]) {
      this.endTournament();
    }
  }

  private createTournamentBracket(): void {
    const nrOfRounds = Math.ceil(Math.log2(this.teams.length));
    const nrOfTeams = Math.pow(2, nrOfRounds);

    this.matches.splice(0);

    // bits is of size 3
    let counter: number[] = Array(nrOfRounds).fill(0),
      bits: boolean[] = Array(nrOfRounds).fill(false);
    for (let i = 0; i < nrOfRounds; ++i) {
      counter[i] = Math.pow(2, i);
    }

    const sortedTeams: Team[] = Array(nrOfTeams).fill(null);
    for (let i = 0; i < nrOfTeams; ++i) {
      let pos = 0;
      bits.forEach((v, i) => {
        pos += v ? Math.pow(2, nrOfRounds - (i + 1)) : 0;
      });
      sortedTeams[pos] = this.teams[i] || null;

      // update bit values
      counter.forEach((v, i) => {
        counter[i]--;
        if (v === 1) {
          counter[i] = Math.pow(2, i + 1);
          bits[i] = !bits[i];
        }
      });
    }

    for (let i = 0; i < sortedTeams.length; i += 2) {
      this.matches.push(
        new Match(sortedTeams[i], sortedTeams[i + 1], this.matchCounter++)
      );
    }
  }
}

export { Tournament };
