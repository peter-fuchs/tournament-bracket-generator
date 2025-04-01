import { Match, Team } from './model';

abstract class BracketMode {
  private _teams: Team[] = [];
  private _elimnatedTeams: Team[] = [];
  private _matches: Match[] = [];
  tournamentOver: boolean = false;
  private _maxNumberOfTeams: number = -1;
  private _mode: string;

  public get mode() {
    return this._mode;
  }

  setProperties(m: BracketMode) {
    console.log(m);
    if (m._teams) {
      this._teams = m._teams.map((team) => Team.from(team));
    }
    this._elimnatedTeams = m._elimnatedTeams.map((team) => Team.from(team));
    this._matches = m._matches.map((match) =>
      Match.from(match, this._teams.concat(this._elimnatedTeams))
    );
    this.tournamentOver = m.tournamentOver;
    this._maxNumberOfTeams = m._maxNumberOfTeams;
    this._mode = m._mode;
  }

  abstract createBracket(): void;
  abstract nextRound(): void;
  abstract eliminatesTeam(): boolean;
  abstract isOver(): boolean;
  abstract get isContinous(): boolean;
  abstract get winner(): Team | null;

  constructor(mode: 'RoundRobin' | 'Tournament' | 'Swiss') {
    this._mode = mode;
  }

  getWaitingMatches(): Match[] {
    return [];
  }

  win(match: Match, winner: Team, canDraw: boolean): void {
    console.log(this.isOver(), winner);

    if (this.isOver()) {
      return;
    }

    const teams = match.getTeams();
    if (!winner) {
      if (!canDraw) {
        throw Error('Matches cannot end in a draw!');
      }

      if (!(teams[0] && teams[1])) {
        throw new Error('Cannot draw free round');
      }
      // match is a draw
      teams[0].draw();
      teams[1].draw();
      return;
    }

    if (!(winner.equals(teams[0]) || winner.equals(teams[1]))) {
      throw new Error('team is not part of the match');
    }

    if (this.eliminatesTeam()) {
      if (winner.equals(teams[0])) {
        if (teams[1]) {
          this.teams = this.teams.filter((val) => !val.equals(teams[1]));
          this.eliminated.push(teams[1]);
        }
      } else {
        if (teams[0]) {
          this.teams = this.teams.filter((val) => !val.equals(teams[0]));
          this.eliminated.push(teams[0]);
        }
      }
    }
    match.played(winner);
  }

  sortTeams(): Team[] {
    this._teams = this._teams
      .filter((team) => team)
      .sort((a: Team, b: Team) => a.compare(b));
    return this._teams;
  }

  startTournament(): void {
    this.tournamentOver = false;

    if (this.teams.length <= 2) {
      this.matches.splice(0);
      this.matches.push(
        new Match(this.teams[0] || undefined, this.teams[1] || undefined, 0)
      );
    }
    this.sortTeams();
  }
  endTournament(): void {
    this.teams = this.teams.filter((team) => team !== null);
    this.tournamentOver = true;
  }

  public setTeams(...teams: Team[]): void {
    this.teams = teams;
  }
  public set teams(teams: Team[]) {
    if (
      teams.length >
      (this.maxNumberTeams < 0 ? teams.length : this.maxNumberTeams)
    ) {
      throw new Error(
        '<ERROR> Number of teams is bigger than maximum allowed number of teams!'
      );
      return;
    }
    this._teams = teams;
  }
  public get teams(): Team[] {
    return this._teams;
  }
  public get eliminated(): Team[] {
    return this._elimnatedTeams;
  }
  public get eliminatedTeams(): Team[] {
    return this._elimnatedTeams;
  }
  public get matches(): Match[] {
    return this._matches.sort((a, b) => a.matchOrder - b.matchOrder);
  }
  set matches(matches: Match[]) {
    this._matches = matches;
  }
  public set maxNumberTeams(value: number) {
    this._maxNumberOfTeams = value;
  }
  public get maxNumberTeams(): number {
    return this._maxNumberOfTeams;
  }
}

export { BracketMode };
