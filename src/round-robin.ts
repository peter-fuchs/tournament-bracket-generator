import { BracketMode } from './bracket-mode';
import { Match, Team } from './model';
import { shuffleArray } from './util';

class RoundRobin extends BracketMode {
  private numberOfGamesPerTeam: {} = {};

  private numberOfRounds: number;

  private waitingMatches: Match[] = [];
  private addWaitingMatches: boolean = false;

  private matchCounter: number = 0;

  constructor(numberOfRounds: number) {
    super('RoundRobin');
    this.numberOfRounds = numberOfRounds;
  }

  public static from(r: RoundRobin): BracketMode {
    const roundRobin: RoundRobin = new RoundRobin(r.numberOfRounds);
    roundRobin.setProperties(r);
    roundRobin.numberOfGamesPerTeam = r.numberOfGamesPerTeam;
    roundRobin.waitingMatches = r.waitingMatches.map((match) =>
      Match.from(match, roundRobin.teams)
    );
    roundRobin.addWaitingMatches = r.addWaitingMatches;
    roundRobin.matchCounter = r.matchCounter;
    return roundRobin;
  }

  eliminatesTeam(): boolean {
    return false;
  }
  get isContinous(): boolean {
    return true;
  }
  get winner(): Team | null {
    if (!this.isOver()) {
      return null;
    }
    return this.sortTeams()[0];
  }

  isOver(): boolean {
    return (
      this.tournamentOver ||
      (this.matches.filter((match) => !match.winner).length === 0 &&
        this.waitingMatches.length === 0)
    );
  }

  getWaitingMatches(): Match[] {
    return this.waitingMatches;
  }

  createBracket() {
    shuffleArray(this.teams);

    if (this.teams.length % 2) {
      this.teams.unshift(null);
      this.addWaitingMatches = true;
    }

    this.setMatches();
  }
  nextRound(): void {
    this.matches = this.matches.filter((match) => !match.winner);
  }

  private setMatches() {
    for (let i = 0; i < this.numberOfRounds; ++i) {
      const size = this.teams.length;

      if (i % 2 === 0 && this.addWaitingMatches) {
        this.waitingMatches.push(
          new Match(
            this.teams[size - 1],
            this.teams[size - 2],
            this.matchCounter++
          )
        );
      }

      for (let i = 0; i < size / 2; ++i) {
        // we insert the "top row" team as team1 since that team may never be null
        if (!this.teams[i]) {
          continue;
        }

        const match = new Match(
          this.teams[size - (i + 1)],
          this.teams[i],
          this.matchCounter++
        );
        this.addMatch(match);
      }

      this.shiftTeams();
    }
  }

  private addMatch(match: Match) {
    this.matches.push(match);

    if (match.getTeams()[1]) {
      match.getTeams().forEach((team) => {
        if (this.numberOfGamesPerTeam[team.id]) {
          this.numberOfGamesPerTeam[team.id]++;
        } else {
          this.numberOfGamesPerTeam[team.id] = 1;
        }
      });
    } else if (!this.numberOfGamesPerTeam[match.getTeams()[0].id]) {
      this.numberOfGamesPerTeam[match.getTeams()[0].id] = 0;
    }
  }

  private shiftTeams(): void {
    const shiftedTeams: Team[] = [this.teams[0]];

    shiftedTeams.push(this.teams[this.teams.length - 1]);
    for (let i = 1; i < this.teams.length - 1; ++i) {
      shiftedTeams.push(this.teams[i]);
    }
    this.teams = shiftedTeams;
  }

  public get gamesPerTeam() {
    return this.numberOfGamesPerTeam;
  }
}

export { RoundRobin };
