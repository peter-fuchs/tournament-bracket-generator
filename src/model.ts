class Team {
  static from(team: Team): any {
    const t = new Team(team._id, team._name, team.elo);
    t._gameScore = team._gameScore;
    return t;
  }
  private _id: string;
  private _name: string;
  private elo: number;
  private _gameScore: { win: number; lose: number } = { win: 0, lose: 0 };

  constructor(id: string, name: string, elo: number = 1000) {
    if (elo <= 0 && !Number.isInteger(elo)) {
      throw Error('Seed must be a positive integer');
    }
    this._id = id;
    this._name = name;
    this.elo = elo;
  }

  draw() {
    // handle drawing
  }

  win(other: Team) {
    // handle winning
    this.elo += 30 * (1 - this.calculateWinProbability(other));
    this._gameScore.win++;
  }

  lose(other: Team) {
    // handle losing
    this.elo += 30 * (0 - this.calculateWinProbability(other));
    this._gameScore.lose++;
  }

  private calculateWinProbability(other: Team) {
    return 1 / (1 + Math.pow(10, (this.elo - other.elo) / 400));
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get gameScore() {
    return this._gameScore;
  }

  compare(other: Team): number {
    if (!other) {
      return 0;
    }
    return other.elo - this.elo;
  }

  equals(other: Team): boolean {
    if (this && !other) {
      return false;
    }
    return this._id === other._id;
  }

  toString(): string {
    return `${this._name} (${this.id})`;
  }
}

class Match {
  equals(other: Match): boolean {
    return this._matchOrder === other._matchOrder;
  }
  static from(match: Match, allTeams: Team[]): Match {
    const m = new Match(
      allTeams.find((team) => team.equals(match.team1)),
      allTeams.find((team) => team.equals(match.team2)),
      match._matchOrder
    );
    m._winner = match._winner;
    return m;
  }
  private team1: Team;
  private team2: Team;
  private _winner: number = 0;
  private _matchOrder: number;

  constructor(team1: Team, team2: Team, matchOrder: number) {
    this.team1 = team1;
    this.team2 = team2;
    this._matchOrder = matchOrder;
  }

  done(winner?: Team): void {
    this.played(winner);
  }

  played(winner?: Team): void {
    if (!winner) {
      if (this.team2) {
        this.team1.draw();
        this.team2.draw();
      }
      return;
    }

    if (!(winner.equals(this.team1) || winner.equals(this.team2))) {
      throw new Error(`<ERROR> ${winner} is not part of this match`);
    }

    if (!this.team2) {
      // no second team set, so team 1 just moves on
      this._winner = 1;
      return;
    }

    if (winner.equals(this.team1)) {
      this._winner = 1;
      this.team1.win(this.team2);
      this.team2.lose(this.team1);
    } else {
      this._winner = 2;
      this.team1.lose(this.team2);
      this.team2.win(this.team1);
    }
  }
  getTeams() {
    return [this.team1, this.team2];
  }
  get winner() {
    if (this._winner === 0) {
      return null;
    }
    return this._winner === 1 ? this.team1 : this.team2;
  }
  get matchOrder() {
    return this._matchOrder;
  }
}

export { Team, Match };
