var currentTeamId = 1 // special case for coordinator

if (sessionStorage.getItem("accessLevel") == 2) {
  currentTeamId = sessionStorage.getItem("teamID")
}
const teamNames = []

async function getTeamCoaches() {
    const teamUrl = "http://football.cscprof.com/teams";
    const response = await fetch(teamUrl); // fetch data
    const data = await response.json(); 

    const teamCoachDict = {}; // create dictionary to hold the coaches for each team

    for (const team of data) {

        teamNames.push(team.Name) // pushes the team name 
        const teamId = team.teamID; // get current team ID
        const coachIds = team.coaches.map(coach => coach.coachID); // get array of all coach IDs from the current team
        teamCoachDict[teamId] = coachIds; // add to dictionary
    }
    return teamCoachDict
}

async function getTeamData() {
    const teamCoachDict = await getTeamCoaches(); // call getTeamCoaches using await
    const coachIds = teamCoachDict[currentTeamId]; // create array which holds the coach IDs from the current team
    const teamAverages = [];
    var teamData = [];

    // loop through each coachID in the array
    for (const currentCoachID of coachIds) {
        const currentAnswerUrl = `http://football.cscprof.com/coaches/${currentCoachID}/answers`;
        const response = await fetch(currentAnswerUrl);
        const data = await response.json();

        // validate that data returns and is in the correct format
        if (data && Array.isArray(data.answers)) {
            const answers = data.answers;
      
            for (let questionID = 2; questionID <= 19; questionID++) {
              let sum = 0;
              let count = 0;
      
              // loops through each answer, adds the answer to sum and iterates count
              for (const answer of answers) {
                if (answer.questionID === questionID && answer.Answer !== null) {
                  sum += parseInt(answer.Answer);
                  count++;
                }
              }

              // validates that count is greater than 0 and calculates average
              const average = count > 0 ? (sum / count).toFixed(1) : null;
      
              // check if array is empty
              if (!teamAverages[questionID - 2]) {
                teamAverages[questionID - 2] = 0;
              }
      
              // add average to array
              if (average !== null) {
                teamAverages[questionID - 2] += parseFloat(average);
              }
            }
          } else {
            console.error('Unexpected or missing data format for coachID:', currentCoachID);
          }
        }

        // create an array of the averages and round to 1 decimal
        const overallTeamAverages = teamAverages.map(avg => (avg / coachIds.length).toFixed(1));
      
        // push team name and data to teamData object
        teamData.push({
          name: teamNames[currentTeamId - 1],
          data: overallTeamAverages,
        });
    
        return teamData;

}
