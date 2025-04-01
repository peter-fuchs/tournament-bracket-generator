import { BracketMode } from './bracket-mode';
import { Match } from './model';
import { RoundRobin } from './round-robin';
import { Tournament } from './tournament';
import { TournamentBracket, Team, Modes } from './tournament-bracket';

let tournament: TournamentBracket;
const teams: Team[] = [];
const modi: BracketMode[] = [];
let matches: Match[] = [];

let createDiv: Element, tournamentDiv: Element, overlay: Element;

let teamsDiv: Element;
let teamnameInput: HTMLInputElement;

let modiDiv: Element;
let modusSelect: HTMLSelectElement;

let createTournamentButton: HTMLButtonElement;

let nextRoundButton: HTMLButtonElement,
  nextModusButton: HTMLButtonElement,
  startTournamentButton: HTMLButtonElement;

let buttonsDiv: Element;

let teamId: number = 0;

let tablesDiv: Element;
let xDiff, yDiff, targetElement;

document.addEventListener('DOMContentLoaded', () => {
  teamsDiv = document.getElementsByClassName('teams')[0];
  modiDiv = document.getElementsByClassName('modi')[0];
  createDiv = document.getElementsByClassName('create-screen')[0];
  tournamentDiv = document.getElementsByClassName('tournament-screen')[0];
  tablesDiv = document.getElementsByClassName('tables')[0];
  overlay = document.getElementsByClassName('overlay')[0];

  createTournamentButton = document.getElementById(
    'createTournament'
  ) as HTMLButtonElement;
  createTournamentButton.addEventListener('click', () =>
    createTournament(false, 5)
  );

  const addTeamButton = document.getElementById('addTeam');
  addTeamButton.addEventListener('click', () => {
    addTeam();
    teamnameInput.value = '';
  });

  teamnameInput = document.getElementById('teamnameInput') as HTMLInputElement;
  teamnameInput.addEventListener('input', (event: InputEvent) => {
    (addTeamButton as HTMLButtonElement).disabled = disableAddTeam(
      (event.target as HTMLInputElement).value
    );
  });

  const addModusButton = document.getElementById('addModus');
  addModusButton.addEventListener('click', () => {
    addModus();
    modusSelect.value = 'roundRobin';
  });
  modusSelect = document.getElementById('selectModus') as HTMLSelectElement;

  buttonsDiv = document.getElementsByClassName('buttons')[0];
  nextRoundButton = document.getElementById(
    'nextRoundButton'
  ) as HTMLButtonElement;
  nextRoundButton.addEventListener('click', startNextRound);
  startTournamentButton = document.getElementById(
    'startTournamentButton'
  ) as HTMLButtonElement;
  startTournamentButton.addEventListener('click', startTournament);

  nextModusButton = document.getElementById(
    'nextModusButton'
  ) as HTMLButtonElement;
  nextModusButton.addEventListener('click', () => {
    nextModus();
  });

  for (let i = 1; i <= 17; ++i) {
    teamnameInput.value = `Team ${i}`;
    addTeam();
  }

  if (sessionStorage.getItem('tournament')) {
    overlay.classList.remove('hidden');
    overlay.classList.add('load-tournament');

    document
      .getElementById('loadTournamentButton')
      .addEventListener('click', loadTournament);
    document
      .getElementById('createNewTournamentButton')
      .addEventListener('click', () => {
        overlay.classList.add('hidden');
        overlay.classList.remove('load-tournament');
      });
  }
});

function startNextRound() {
  matches = nextRound();
  for (let i = 0; i < tournament.nrSimultaneousGames; ++i) {
    const table = tablesDiv.children[i];

    if (!matches[i]) {
      table.getElementsByClassName('team1')[0].innerHTML = '';
      table.getElementsByClassName('team2')[0].innerHTML = '';
      table.id = '';
      continue;
    }
    table.classList.remove('over');

    const teams = matches[i].getTeams();
    table.getElementsByClassName('team1')[0].classList.remove('winner');
    table.getElementsByClassName('team2')[0].classList.remove('winner');
    if (matches[i].winner) {
      const winner = teams.indexOf(matches[i].winner) + 1;
      table.getElementsByClassName(`team${winner}`)[0].classList.add('winner');
      table.classList.add('over');
    }
    table.getElementsByClassName(
      'team1'
    )[0].innerHTML = `<span>${teams[0].name}</span>`;
    table.getElementsByClassName(
      'team2'
    )[0].innerHTML = `<span>${teams[1].name}</span>`;
    table.id = `match__${matches[i].matchOrder}`;
  }
  buttonsDiv.classList.remove('next-round');
}

function loadTournament() {
  tournament = TournamentBracket.from(
    JSON.parse(sessionStorage.getItem('tournament')) as TournamentBracket
  );

  overlay.classList.add('hidden');
  overlay.classList.remove('load-tournament');

  createDiv.classList.add('hidden');
  tournamentDiv.classList.remove('hidden');
  addTables();
  updateScore();

  if (tournament.modusOver()) {
    nextModus();
  } else {
    startNextRound();
  }
}

function createTournament(canDraw: boolean, nrSimultaneousGames: number) {
  tournament = new TournamentBracket(canDraw);
  tournament.nrSimultaneousGames = nrSimultaneousGames;

  tournament.setModi(...modi);
  tournament.setTeams(...teams);

  tournament.start();
  // console.log('created tournament', tournament);

  createDiv.classList.add('hidden');
  tournamentDiv.classList.remove('hidden');
  addTables();
  updateScore();

  buttonsDiv.classList.add('start-tournament');
}

function startTournament() {
  buttonsDiv.classList.remove('start-tournament');
  startNextRound();

  sessionStorage.setItem('tournament', JSON.stringify(tournament));
}

function addTeam() {
  const id = `team_${teamId++}`,
    name = teamnameInput.value.trim();
  const t: Team = new Team(id, name, 1000);
  teams.push(t);

  createTeamDiv(id, name);

  createTournamentButton.disabled = isTournamentButtonDisabled();
}

function removeTeam(id: string) {
  teams.splice(
    teams.findIndex((team) => team.id === id),
    1
  );
  const div = document.getElementsByClassName(`team_${id}`)[0];
  div.remove();

  createTournamentButton.disabled = isTournamentButtonDisabled();
}

function updateTeamName(teamId: string, newTeamName: string) {
  const index = teams.findIndex((team) => team.id === teamId);
  teams[index] = new Team(teamId, newTeamName, 1000);
}

function addModus() {
  const index = 0;
  const id = `modus_${index}`,
    modus: 'roundRobin' | 'tournament' | 'swiss' | string = modusSelect.value;

  let m: BracketMode;
  switch (modus) {
    case 'roundRobin':
      m = Modes.ROUND_ROBIN(4);
      break;
    case 'swiss':
      m = Modes.SWISS;
      break;
    case 'tournament':
    default:
      m = Modes.TOURNAMENT;
      m.maxNumberTeams = 8;
  }
  modi.push(m);

  createBracketModusDiv(modi.length - 1, modus);

  createTournamentButton.disabled = isTournamentButtonDisabled();
}

function removeModus(index: number) {
  modi.splice(index, 1);
  const div = document.getElementById(`modus_${index}`);
  div.remove();

  updateModiIndices();

  createTournamentButton.disabled = isTournamentButtonDisabled();
}

function updateModus(index: number, modus: string) {
  let m: BracketMode;
  switch (modus) {
    case 'roundRobin':
      m = Modes.ROUND_ROBIN(4);
      break;
    case 'swiss':
      m = Modes.SWISS;
      break;
    case 'tournament':
    default:
      m = Modes.TOURNAMENT;
      m.maxNumberTeams = 8;
  }
  modi[index] = m;
}

function getNextMatches(): Match[] {
  return tournament.nextMatches();
}

function nextRound(): Match[] {
  const matches = getNextMatches();

  return matches;
}

function nextModus(): void {
  buttonsDiv.classList.remove('next-modus');
  overlay.classList.remove('next-modus');

  if (!tournament.hasNextModus()) {
    tournamentOver();
    return;
  }

  overlay.classList.add('hidden');
  tournament.nextModus();
  startNextRound();
  sessionStorage.setItem('tournament', JSON.stringify(tournament));
}

function tournamentOver() {
  overlay.classList.remove('hidden');
  overlay.classList.add('tournament-over');

  console.log(tournament, tournament.winner);

  sessionStorage.removeItem('tournament');
}

function isTournamentButtonDisabled(): boolean {
  return modi.length === 0 || teams.length === 0;
}

function updateModiIndices() {
  let index = 0;
  for (const modus of modiDiv.children) {
    modus.id = `modus_${index++}`;
  }
}

function createBracketModusDiv(index: number, mode: string) {
  const div = document.createElement('div');
  div.id = `modus_${index}`;
  div.classList.add('modus');

  const mainBracketModus = document.createElement('div');
  mainBracketModus.classList.add('bracket-mode');

  const select = document.createElement('select');
  let option = document.createElement('option');
  option.value = 'roundRobin';
  option.innerText = 'Round Robin';
  select.appendChild(option);

  option = document.createElement('option');
  option.value = 'tournament';
  option.innerText = 'Tournament';
  select.appendChild(option);

  option = document.createElement('option');
  option.value = 'swiss';
  option.innerText = 'Swiss Stage';
  select.appendChild(option);

  select.value = mode;
  select.addEventListener('change', function () {
    updateModus(
      +this.parentElement.id.substring(this.parentElement.id.indexOf('_') + 1),
      this.value
    );
  });
  mainBracketModus.appendChild(select);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', function () {
    removeModus(
      +this.parentElement.id.substring(this.parentElement.id.indexOf('_') + 1)
    );
  });
  mainBracketModus.appendChild(deleteButton);

  div.appendChild(mainBracketModus);

  switch (mode) {
    case 'roundRobin':
      addModusOption(div, 'number of rounds', 4, function () {
        const div = this.parentElement.parentElement;
        const index = +div.id.substring(div.id.indexOf('_') + 1);
        modi[index] = Modes.ROUND_ROBIN(this.value);
      });
      break;
    case 'tournament':
      addModusOption(div, 'number of teams', 8, function () {
        const div = this.parentElement.parentElement;
        const index = +div.id.substring(div.id.indexOf('_') + 1);
        modi[index].maxNumberTeams = this.value;
      });
      break;
    case 'swiss':
      break;
  }

  modiDiv.appendChild(div);
}

function addModusOption(
  div: Element,
  label: string,
  defaultValue: number,
  callback: () => void
) {
  const parentDiv = document.createElement('div');

  const labelEl = document.createElement('label');
  labelEl.innerText = label;
  parentDiv.appendChild(labelEl);

  const input = document.createElement('input');
  input.type = 'number';
  input.value = `${defaultValue}`;
  input.addEventListener('input', callback);
  parentDiv.appendChild(input);

  div.appendChild(parentDiv);
}

function createTeamDiv(id: string, name: string) {
  const div = document.createElement('div');
  div.classList.add('team', `team_${id}`);

  const input = document.createElement('input');
  input.value = name;
  input.addEventListener('input', (event: InputEvent) => {
    updateTeamName(id, (event.target as HTMLInputElement).value);
  });
  div.appendChild(input);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', () => removeTeam(id));
  div.appendChild(deleteButton);

  teamsDiv.appendChild(div);
}

function disableAddTeam(value: string): boolean {
  if (value.trim() === '') {
    return true;
  }

  return (
    teams.find(
      (team) => team.name.toLowerCase() === value.toLowerCase().trim()
    ) !== undefined
  );
}

function updateScore() {
  const teamScores = document.getElementsByClassName('team-scores')[0];
  teamScores.innerHTML = '';

  const teams = tournament.sortTeams();

  let place = 1;
  for (const team of teams) {
    const li = document.createElement('li');
    li.classList.add('team-score');

    const teamName = document.createElement('h3');
    teamName.innerText = `${place++}. ${team.name}`;
    li.appendChild(teamName);

    const score = document.createElement('h3');
    score.innerText = `${team.gameScore.win} - ${team.gameScore.lose}`;

    const label = document.createElement('span');
    label.innerText = '';
    score.appendChild(label);

    li.appendChild(score);
    teamScores.appendChild(li);
  }
}

function winMatch(div: HTMLElement, winnerTeam: 1 | 2) {
  let tableDiv = div;
  while (!tableDiv.classList.contains('table')) {
    tableDiv = tableDiv.parentElement;
  }
  const matchOrder = tableDiv.id.slice('match__'.length);

  if (!matchOrder || matchOrder.trim() === '') {
    console.log('match order was (not yet) set!');
    return;
  }

  const match = matches.filter((match) => match.matchOrder === +matchOrder)[0];

  if (
    match.winner ||
    !confirm(
      `Confirm that ${match.getTeams()[winnerTeam - 1].name} won the game`
    )
  ) {
    return;
  }

  tournament.win(match, match.getTeams()[winnerTeam - 1]);

  sessionStorage.setItem('tournament', JSON.stringify(tournament));

  tableDiv.classList.add('over');
  div.classList.add('winner');
  const ongoingMatches = matches.filter((match) => !match.winner);

  if (ongoingMatches.length === 0) {
    if (tournament.modusOver()) {
      if (tournament.hasNextModus()) {
        buttonsDiv.classList.add('next-modus');
        overlay.classList.remove('hidden');
        overlay.classList.add('next-modus');
      } else {
        tournamentOver();
      }
    } else {
      buttonsDiv.classList.add('next-round');
    }
  }

  updateScore();
}

function addTables() {
  for (let i = 0; i < tournament.nrSimultaneousGames; ++i) {
    const div = document.createElement('div');
    div.classList.add('table', 'over');
    div.style.left = `${(i % 3) * 230}px`;
    div.style.top = `${(i > 2 ? 1 : 0) * 400}px`;

    const moveIcon = document.createElement('div');
    moveIcon.classList.add('move-icon');
    moveIcon.innerText = '';
    div.appendChild(moveIcon);

    const tableContent = document.createElement('div');
    tableContent.classList.add('table-content');

    const team1 = document.createElement('div');
    team1.classList.add('team', 'team1');
    team1.addEventListener('click', function () {
      winMatch(this, 1);
    });
    tableContent.appendChild(team1);

    const divider = document.createElement('span');
    tableContent.appendChild(divider);

    const team2 = document.createElement('div');
    team2.classList.add('team', 'team2');
    team2.addEventListener('click', function () {
      winMatch(this, 2);
    });
    tableContent.appendChild(team2);

    div.appendChild(tableContent);

    tablesDiv.appendChild(div);
  }

  const tables = document.getElementsByClassName('table');

  for (const table of tables) {
    (table as HTMLDivElement).addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        let target = event.target as HTMLElement;
        while (!target.classList.contains('table') && target.parentElement) {
          target = target.parentElement;
        }

        xDiff = event.clientX - target.offsetLeft;
        yDiff = event.clientY - target.offsetTop;
        targetElement = target;
        document.addEventListener('mousemove', onMouseMove);
      }
    );
  }
}

function onMouseMove(event: MouseEvent) {
  targetElement.style.left = `${event.clientX - xDiff}px`;
  targetElement.style.top = `${event.clientY - yDiff}px`;
}

document.addEventListener('mouseup', () => {
  targetElement = null;
  document.removeEventListener('mousemove', onMouseMove, false);
});
