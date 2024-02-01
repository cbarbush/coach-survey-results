const leagueAnswerUrl = "http://football.cscprof.com/answers";
const teamsUrl = "http://football.cscprof.com/teams";
var coachData = []


async function getLeagueAverage() {
    const response = await fetch(leagueAnswerUrl);  // fetch data
    const data = await response.json();

    const answers = data;
    const coachAverages = []

    // loop through all questions with numerical responses
    for (let questionID = 2; questionID <= 19; questionID++) {
        let sum = 0;
        let count = 0;

        // loop through each answer
        for (const answer of answers) {
            // check question ID and make sure the answer is not empty
            if (answer.questionID === questionID && answer.Answer !== null) {
                sum += parseInt(answer.Answer);
                count++;
            }
        }

        // verify that count is not 0, calculate average
        const average = count > 0 ? (sum / count).toFixed(1) : null;
        coachAverages.push(average); // push data to an array 
    }
    // push data to coachData object
    coachData.push({
        name: "League Average",
        data: coachAverages,
      });
}   






  


async function getAllAverages() {
    await getLeagueAverage()
    const responseAnswers = await fetch(leagueAnswerUrl); // fetch league data
    const answersData = await responseAnswers.json();

    const responseTeams = await fetch(teamsUrl); // fetch team data
    const teamsData = await responseTeams.json();

    const organizedCoaches = {}; // create dictionary for coaches

    // loop through each team and split coaches by description
    teamsData.forEach((team) => {
        const description = team.Description;
        if (!organizedCoaches[description]) {
            organizedCoaches[description] = [];
        }
        team.coaches.forEach((coach) => {
            organizedCoaches[description].push(coach.coachID);
        });
    });

    // loop through the coach IDs in each description from the dictionary
    for (const description in organizedCoaches) {
        const coachIDs = organizedCoaches[description];
        const data = [];

        // loop through valid questions
        for (let questionID = 2; questionID <= 19; questionID++) {
            // get the sum of answers for the current question
            const sum = coachIDs.reduce((total, coachID) => {
                // create array of answers and filter
                const coachAnswers = answersData.filter(answer => answer.coachID === coachID && answer.questionID === questionID && answer.Answer !== null);

                // calculate the sum by adding all answers for the current question
                const coachSum = coachAnswers.reduce((coachTotal, answer) => coachTotal + parseInt(answer.Answer), 0);
                return total + coachSum;
            }, 0);

            // get the count of valid answers
            const count = coachIDs.reduce((totalCount, coachID) => {
                const coachAnswers = answersData.filter(answer => answer.coachID === coachID && answer.questionID === questionID && answer.Answer !== null);
                return totalCount + coachAnswers.length;
            }, 0);

            // calculate average
            const average = count > 0 ? (sum / count).toFixed(1) : null;

            data.push(parseFloat(average)); // convert average to float and push to data
        }

        coachData.push({ name: description, data }); // push the description and data to the coachData object
    }
    return coachData;
}



