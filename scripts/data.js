const questionUrl = "http://football.cscprof.com/questions"
var coachID = parseInt(sessionStorage.getItem("coachID"))
var answerUrl = `http://football.cscprof.com/coaches/${coachID}/answers`
var averages = [];
var coachData = [];
var chartHeight;
const preloader = document.querySelector(".preloader")
const coachUrl = "http://football.cscprof.com/coaches";
var headCoaches = [];

// function to enable drop down box
function enableDropDown() {
  if ((window.location.pathname.includes('team.html') || window.location.pathname.includes('assistant.html')) && sessionStorage.getItem("accessLevel") == 3) {
    var dropDown = document.querySelector('.select-container')
    dropDown.classList.remove('disabled')
  }
}

enableDropDown()

async function getQuestions() {
    const response = await fetch(questionUrl); // fetch questions
    return await response.json();
}

getQuestions();

// function to update the tooltip on the chart
function updateTooltip(seriesIndex, dataPointIndex, questions) {
  const question = questions[dataPointIndex]; // get questions
  const questionNumber = dataPointIndex + 1;
  // return an element with the question number and question
  return `<span class="tt">${questionNumber}. ${question ? question.Question : 'No question found'}</span>`;
}

const chartDiv = document.querySelector("#chart1");
// function to run when team is selected from drop down box
function selectTeam() {
  var teamSelect = document.getElementById("team");
  selectedIndex = teamSelect.selectedIndex; // get index from drop down box
  const headCoachIDs = Object.keys(coachCount); // create array of head coach IDs
  coachID = parseInt(headCoachIDs[selectedIndex]);
  console.log("Head Coach ID from array: " + coachID)
}


const teamElement = document.getElementById("team");

// check that teamElement exists
if (teamElement) {
  teamElement.addEventListener("change", function () {
    console.log("Selection changed.")
    
    const accessLevel = parseInt(sessionStorage.getItem("accessLevel"));
    chartDiv.classList.add("chartHide");
    preloader.classList.remove("disabled");
    // if statement for assistant page
    if (accessLevel === 3 && window.location.pathname.includes('assistant.html')) {
      selectTeam();
      renderCharts();
    }

    // if statement for team page
    if (accessLevel === 3 && window.location.pathname.includes('team.html')) {
      var teamSelect = document.getElementById("team");
      selectedIndex = teamSelect.selectedIndex;
      teamIdArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      currentTeamId = teamIdArr[selectedIndex];
      renderCharts();
    }
  });
}

const coachCount = {}; // create empty dictionary

async function getAssistantNumber() {
  const teamUrl = "http://football.cscprof.com/teams";
  const response = await fetch(teamUrl); // fetch data
  const data = await response.json(); 

  // loop through each team and add head coach IDs as keys and the number of assistants as values
  data.forEach(team => {
    const headCoach = team.coaches.find(coach => coach.AccessLevel === 2);

    if (headCoach) {
      const headCoachID = headCoach.coachID;

      const assistantCount = team.coaches.reduce((count, coach) => {
        return count + (coach.AccessLevel === 1 ? 1 : 0);
      }, 0);

      coachCount[headCoachID] = assistantCount;
    }
  });
  console.log(coachCount);
}

// function to create an array with all head coach IDs
async function getHeadCoaches() {
  const response = await fetch(coachUrl);
  const coaches = await response.json();

  for (const coach of coaches) {
    if (coach.AccessLevel == 2){
      headCoaches.push(coach.coachID);
    }
  }
  return headCoaches;
}


async function getHeadCoachData() {
  headCoArr = await getHeadCoaches() // get head coach IDs from getHeadCoaches
    console.log(headCoArr)
      for (const currentCoachID of headCoaches) {
        
        const currentAnswerUrl = `http://football.cscprof.com/coaches/${currentCoachID}/answers`;
        const response = await fetch(currentAnswerUrl);
        const data = await response.json();
  
        console.log(currentCoachID)
  
        // validate that data exists and is in the correct format
        if (data && Array.isArray(data.answers)) {
          const answers = data.answers;
          const coachName = data.Name;
  
          const coachAverages = [];
  
          // loop through each question and get the average answer for each
          for (let questionID = 2; questionID <= 19; questionID++) {
            let sum = 0;
            let count = 0;
  
            for (const answer of answers) {
              if (answer.questionID === questionID && answer.Answer !== null) {
                sum += parseInt(answer.Answer);
                count++;
              }
            }
  
            const average = count > 0 ? (sum / count).toFixed(1) : null;
            coachAverages.push(average);
          }
  
          // push average and coach name to coachData object
          coachData.push({
            name: coachName,
            data: coachAverages,
          });
          
        } else {
          console.error('Unexpected or missing data format for coachID:', currentCoachID);
        }
      }
      return coachData;
}


async function getData() {
  averages = [];
  const accessLevel = parseInt(sessionStorage.getItem("accessLevel")); // get access level from session storage
  let iterator, startingCoachID, endingCoachID;
  let checkHead = false;
  

  // special case for head coach on head coach page
  if (accessLevel == 2 && window.location.pathname.includes('head.html')) {
    checkHead = true;
  }

  if (accessLevel > 1 && !checkHead) {
    chartHeight = 'auto';
    
    if (window.location.pathname.includes('assistant.html')) {
      await getAssistantNumber(); // get number of assistant coaches from function
      if (accessLevel == 3) {
        selectTeam(); // handle the drop down menu for coordinator
      }

      // set values for for loop
      startingCoachID = coachID + 1;
      iterator = 1;
      endingCoachID = startingCoachID + coachCount[coachID] - 1;
    }

    coachData = [];

    // special case for team page
    if (window.location.pathname.includes('team.html')) {
      chartHeight = '150'
      coachData = await getTeamData()
    }

    // special case for league page
    if (window.location.pathname.includes('league.html')) {
      coachData = await getAllAverages();
    }

    // special case for head coach page as coordinator
    if (window.location.pathname.includes('head.html') && accessLevel == 3) {
      coachData = await getHeadCoachData();
    }




    // loop through each coach
    for (let currentCoachID = startingCoachID; currentCoachID <= endingCoachID; currentCoachID += iterator) {
      const currentAnswerUrl = `http://football.cscprof.com/coaches/${currentCoachID}/answers`; // send a request for each coach in the loop
      const response = await fetch(currentAnswerUrl); // fetch data
      const data = await response.json();

      console.log(currentCoachID)

      // validate that data exists and is in the correct format
      if (data && Array.isArray(data.answers)) {
        const answers = data.answers;
        const coachName = data.Name;

        const coachAverages = [];

        // get average for each question and push to an array
        for (let questionID = 2; questionID <= 19; questionID++) {
          let sum = 0;
          let count = 0;

          for (const answer of answers) {
            if (answer.questionID === questionID && answer.Answer !== null) {
              sum += parseInt(answer.Answer);
              count++;
            }
          }

          const average = count > 0 ? (sum / count).toFixed(1) : null;
          coachAverages.push(average);
        }

        // push average and coach name to coachData object
        coachData.push({
          name: coachName,
          data: coachAverages,
        });
        
      } else {
        console.error('Unexpected or missing data format for coachID:', currentCoachID);
      }
    }
  } 

  // case to handle individual coach
  else {
    chartHeight = '150'
    const response = await fetch(answerUrl);
    const data = await response.json();
    
    // validate that data exists and is in the correct format
    if (data && Array.isArray(data.answers)) {
      const answers = data.answers;

      // loop through each question and calculate average answer
      for (let questionID = 2; questionID <= 19; questionID++) {
        let sum = 0;
        let count = 0;

        for (const answer of answers) {
          if (answer.questionID === questionID && answer.Answer !== null) {
            sum += parseInt(answer.Answer);
            count++;
          }
        }

        const average = count > 0 ? (sum / count).toFixed(1) : null;
        averages.push(average); // push average to array
      }

      // push average and coach name to coachData object
      coachData.push({
        name: sessionStorage.getItem("coachName"),
        data: averages
      })
    } 
    else {
      console.error('Unexpected or missing data format. Please check the API response structure.');
    }
  }
}








let chart1;

async function renderCharts() {
  await getData(); // get the coachData from the function
  const questions = await getQuestions(); // get questions for tooltip

  // chart options
  const options1 = {
      chart: {
          width: '1000px',
          height: chartHeight,
          type: 'heatmap',
          background: '#f4f4f4',
          foreColor: '#333',
          toolbar: {
              show: false
            },
            zoom: {
              enabled: false,
            }
      },
      
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 0,
          useFillColorAsStroke: false,
          colorScale: {
            ranges: [{
                from: 0,
                to: 0.9,
                name: 'Poor',
                color: '#b3cde0', 
                foreColor: '#000'
              },
              {
                from: 1.0,
                to: 2.0,
                name: 'Below Average',
                color: '#6497b1'
              },
              {
                from: 2.1,
                to: 3.0,
                name: 'Fair',
                color: '#005b96'
              },
              {
                from: 3.1,
                to: 4.0,
                name: 'Good',
                color: '#03396c'
              },
              {
                from: 4.1,
                to: 5.0,
                name: 'Excellent',
                color: '#011f4b'
              }
            ]
          }
        }
      },
      
      series: coachData,
      colors: ["#008FFB"],
      tooltip: {
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          return updateTooltip(seriesIndex, dataPointIndex, questions); // run updateTooltip
        }
      },
      legend: {
        fontSize: '12px',
        itemMargin: {
          horizontal: 5,
          vertical: 20
        }
      }
  }
  preloader.classList.add("disabled") // disable the spinner
  chartDiv.classList.remove("chartHide") 
  // check if chart exists
  if (!chart1) {
    chart1 = new ApexCharts(document.querySelector('#chart1'), options1);
    chart1.render();
  } 
  // if the chart exists, update the data instead of rendering a new one
  else {
    chart1.updateSeries(coachData, true);
  }
}

renderCharts()