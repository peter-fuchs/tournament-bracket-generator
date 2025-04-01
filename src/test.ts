import { Team } from './model';
import { RoundRobin } from './round-robin';
import { Modes, TournamentBracket } from './tournament-bracket';

function testNumberOfTournaments() {
  for (let nrTeams = 10; nrTeams <= 30; ++nrTeams) {
    for (let nrRounds = 2; nrRounds < 6; nrRounds++) {
      for (
        let nrSimultaneousGames = 3;
        nrSimultaneousGames < 8;
        nrSimultaneousGames++
      ) {
        if (nrTeams % 2 === 1 && nrRounds % 2 === 1) {
          continue;
        }

        console.log(nrTeams, nrRounds);

        const tournament = new TournamentBracket(false);
        tournament.setModi(Modes.ROUND_ROBIN(nrRounds), Modes.TOURNAMENT);
        tournament.nrSimultaneousGames = 5;

        tournament.modi[1].maxNumberTeams = 8;

        const teams: Team[] = [];
        for (let i = 0; i < nrTeams; ++i) {
          teams.push(new Team(`team${i}`, `team${i}`));
        }

        tournament.setTeams(...teams);

        tournament.start();

        while (tournament.nextMatches().length) {
          for (const m of tournament.currentMatches()) {
            tournament.win(m, m.getTeams()[Math.random() > 0.5 ? 0 : 1]);
          }
        }

        tournament.teams.forEach((team) => {
          if (team) {
            const nrGamesPlayed = team.gameScore.win + team.gameScore.lose;
            if (nrGamesPlayed !== nrRounds) {
              console.error(
                tournament.teams,
                team,
                nrTeams,
                nrGamesPlayed,
                nrRounds
              );
              throw new Error('Number of games doesnt match number of rounds');
            }
          }
        });
        tournament.nextModus();

        while (tournament.nextMatches().length) {
          for (const m of tournament.currentMatches()) {
            tournament.win(m, m.getTeams()[Math.random() > 0.5 ? 0 : 1]);
          }
        }
      }
    }
  }
}

function testSpecific() {
  const nrRounds = 2,
    nrTeams = 10;
  const tournament = new TournamentBracket(false);
  tournament.setModi(Modes.ROUND_ROBIN(nrRounds), Modes.TOURNAMENT);
  tournament.nrSimultaneousGames = 5;

  tournament.modi[1].maxNumberTeams = 8;

  const teams: Team[] = [];
  for (let i = 0; i < nrTeams; ++i) {
    teams.push(new Team(`team${i}`, `team${i}`));
  }

  tournament.setTeams(...teams);

  tournament.start();

  while (tournament.nextMatches().length) {
    for (const m of tournament.currentMatches()) {
      tournament.win(m, m.getTeams()[Math.random() > 0.5 ? 0 : 1]);
    }
  }

  tournament.teams.forEach((team) => {
    if (team) {
      const nrGamesPlayed = team.gameScore.win + team.gameScore.lose;
      if (nrGamesPlayed !== nrRounds) {
        console.error(tournament.teams, team, nrTeams, nrGamesPlayed, nrRounds);
        console.log((tournament.modi[0] as RoundRobin).gamesPerTeam);
        throw new Error('Number of games doesnt match number of rounds');
      }
    }
  });
  tournament.nextModus();

  while (tournament.nextMatches().length) {
    for (const m of tournament.currentMatches()) {
      tournament.win(m, m.getTeams()[Math.random() > 0.5 ? 0 : 1]);
    }
  }
}

function testNotAllMatchesFinished() {
  const tournament = new TournamentBracket(false);
  tournament.setModi(Modes.ROUND_ROBIN(4), Modes.TOURNAMENT);
  tournament.nrSimultaneousGames = 5;

  tournament.modi[1].maxNumberTeams = 8;

  const teams: Team[] = [];
  for (let i = 0; i < 17; ++i) {
    teams.push(new Team(`team${i}`, `team${i}`));
  }

  tournament.setTeams(...teams);

  tournament.start();

  tournament.nextMatches();
  for (const m of tournament.currentMatches().slice(1)) {
    tournament.win(m, m.getTeams()[Math.random() > 0.5 ? 0 : 1]);
  }
  tournament.nextMatches();
  console.log(tournament.currentMatches());
  tournament.nextMatches();
  console.log(tournament.currentMatches());
  tournament.nextMatches();
  console.log(tournament.currentMatches());
}

testSpecific();
testNumberOfTournaments();
// testNotAllMatchesFinished();
