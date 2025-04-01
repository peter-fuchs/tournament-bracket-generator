import { BracketMode } from './bracket-mode';
import { RoundRobin, Swiss, Tournament } from './bracket-type';
import { Match, Team } from './model';

const Modes = {
  ROUND_ROBIN(numberOfRounds: number) {
    return new RoundRobin(numberOfRounds);
  },
  SWISS: new Swiss('Swiss'),
  TOURNAMENT: new Tournament(),
};

class TournamentBracket {
  private _modi: BracketMode[] = [];
  private activeBracket: number = 0;
  private matchesCanDraw: boolean = true;
  private _simultaneousGames: number = 1;

  private activeMatches: Match[] = [];

  constructor(matchesCanDraw: boolean) {
    this.matchesCanDraw = matchesCanDraw;
  }

  static from(t: TournamentBracket): TournamentBracket {
    const tournament = new TournamentBracket(t.matchesCanDraw);
    tournament._modi = t._modi.map((modus) => {
      let mode: BracketMode;

      switch ((modus as any)._mode) {
        case 'RoundRobin':
          mode = RoundRobin.from(modus as RoundRobin);
          break;
        case 'Tournament':
          mode = Tournament.from(modus as Tournament);
          break;
        case 'Swiss':
          mode = Swiss.from(modus as Swiss);
          break;
      }

      return mode;
    });
    tournament.activeBracket = t.activeBracket;
    tournament._simultaneousGames = t._simultaneousGames;
    tournament.activeMatches = t.activeMatches.map((match) =>
      tournament._modi[tournament.activeBracket].matches.find((m) =>
        m.equals(match)
      )
    );

    return tournament;
  }

  public get winner(): Team | null {
    if (this.hasNextModus() || !this.modus.isOver()) {
      return null;
    }

    return this.modus.winner;
  }

  start(): void {
    this.activeBracket = 0;
    this.createBracket();
  }
  modusOver(): boolean {
    return this.modus.isOver();
  }
  createBracket() {
    this.modus.createBracket();
  }
  hasNextModus() {
    return this.activeBracket + 1 < this.modi.length;
  }
  nextModus(): boolean {
    if (!this.hasNextModus()) {
      console.log('tournament over');
      return false;
    }

    this.activeBracket++;

    const oldModus = this.modi[this.activeBracket - 1];
    const newModus = this.modi[this.activeBracket];
    oldModus.endTournament();
    oldModus.sortTeams();
    const teams = oldModus.teams;
    newModus.teams = teams.slice(0, newModus.maxNumberTeams);
    newModus.createBracket();

    return true;
  }
  sortTeams(): Team[] {
    return this.modus.sortTeams();
  }
  win(match: Match, winner: Team) {
    if (!this.activeMatches.includes(match)) {
      throw new Error("<ERROR> Match isn't played right now");
    }
    if (match.winner) {
      throw new Error('<ERROR> Match already has a winner!');
    }

    this.modus.win(match, winner, this.matchesCanDraw);
  }
  currentMatches(): Match[] {
    const playingTeams = this.activeMatches
      .flatMap((match) => match.getTeams())
      .filter((team) => team !== null);
    playingTeams.sort((a, b) => a.id.localeCompare(b.id));
    let duplicate = false;
    playingTeams.forEach((team, index) => {
      if (team.equals(playingTeams[index + 1])) {
        duplicate = true;
      }
    });
    if (duplicate) {
      throw new Error('<ERROR> DUPLICATE FOUND!');
    }

    return this.activeMatches;
  }
  nextMatches(): Match[] {
    let unfinishedMatches =
      this.activeMatches.filter((match) => !match.winner).length > 0;
    if (unfinishedMatches) {
      console.error('Some matches are still ongoing!');
      return this.activeMatches;
    }

    let waitingMatches = this.modus.getWaitingMatches();

    this.activeMatches.splice(0);

    let matches = this.modus.matches
      .filter((match) => !match.winner)
      .slice(0, this.nrSimultaneousGames);

    if (matches.length >= this.nrSimultaneousGames) {
      matches = this.insertPotentialWaitingMatches(waitingMatches, matches);

      this.activeMatches = matches;
      return this.activeMatches;
    }

    if (this.modus.isContinous || matches.length === 0) {
      this.modus.nextRound();
      const newMatches = this.modus.matches
        .filter((match) => !match.winner)
        .slice(0, this.nrSimultaneousGames - matches.length);

      for (const match of newMatches) {
        if (!matches.includes(match)) {
          matches.push(match);
        }
      }
    }

    matches = this.insertPotentialWaitingMatches(waitingMatches, matches);
    this.activeMatches = matches;

    return this.activeMatches;
  }

  private insertPotentialWaitingMatches(
    waitingMatches: Match[],
    insertInto: Match[]
  ): Match[] {
    if (waitingMatches.length === 0) {
      return insertInto;
    }

    let matchInserted = false;

    const insertTeams = new Set(
      insertInto
        .slice(0, this.nrSimultaneousGames - 1)
        .flatMap((match) => match.getTeams())
    );

    for (let i = 0; i < waitingMatches.length; ++i) {
      let teams = waitingMatches[i].getTeams();
      if (!insertTeams.has(teams[0]) && !insertTeams.has(teams[1])) {
        insertInto.unshift(waitingMatches[i]);
        if (insertInto.length >= this.nrSimultaneousGames) {
          insertInto = insertInto.slice(0, this.nrSimultaneousGames);
        }
        this.modus.matches.push(...waitingMatches.splice(i, 1));
        matchInserted = true;

        break;
      }
    }

    if (matchInserted && waitingMatches.length > 0) {
      insertInto = this.insertPotentialWaitingMatches(
        waitingMatches,
        insertInto
      );
    }

    return insertInto;
  }

  public setTeams(...teams: Team[]): void {
    this.modus.teams = teams;
  }
  public get teams(): Team[] {
    return this.modus.teams;
  }

  public setModi(...modi: BracketMode[]): void {
    this.modi = modi;
  }
  public addModus(modus: BracketMode): void {
    this.modi.push(modus);
  }
  public set modi(modi: BracketMode[]) {
    this._modi = modi;
    this._modi.forEach((mode) => {});
  }
  public get modi(): BracketMode[] {
    return this._modi;
  }
  public set nrSimultaneousGames(value: number) {
    this._simultaneousGames = value;
  }
  public get nrSimultaneousGames(): number {
    return this._simultaneousGames;
  }

  private get modus(): BracketMode {
    return this.modi[this.activeBracket];
  }
}

export { TournamentBracket, Modes, Team };
