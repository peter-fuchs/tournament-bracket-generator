import { BracketMode } from './bracket-mode';
import { Match, Team } from './model';

class Swiss extends BracketMode {
  static from(s: Swiss): BracketMode {
    throw new Error('Method not implemented.');
  }
  get winner(): Team {
    throw new Error('Method not implemented.');
  }
  isOver(): boolean {
    throw new Error('Method not implemented.');
  }
  get isContinous(): boolean {
    throw new Error('Method not implemented.');
  }
  canDraw(): boolean {
    throw new Error('Method not implemented.');
  }
  nextRound(): void {
    throw new Error('Method not implemented.');
  }
  eliminatesTeam(): boolean {
    throw new Error('Method not implemented.');
  }
  win(match: Match, winner: Team) {
    throw new Error('Method not implemented.');
  }
  createBracket() {}
}

export { Swiss };
