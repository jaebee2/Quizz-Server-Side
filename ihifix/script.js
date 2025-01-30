
// Get the DOM elements
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const resultContainer = document.getElementById('result-container');
const highScoreContainer = document.getElementById('high-score-container');
const timerElement = document.getElementById('timer');

// Variables for shuffled questions, current question index, score, and username
let shuffledQuestions = [];
let currentQuestionIndex;
let score = 0;
let userName = "";

// Create audio elements for sound effects
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const completionSound = new Audio('completion.mp3');
const timerSound = new Audio('timer.mp3');

// Timer variable
let timerInterval;

// Add event listener to the start button
startButton.addEventListener('click', async () => {
  userName = prompt("Enter your name:"); // Prompt user for their name
  if (userName) {
    await loadQuestions(); // Fetch questions from JSON file
    startGame();
  }
});

// Add event listener to the next button
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  setNextQuestion();
});

// Load questions from an external JSON file
async function loadQuestions() {
  try {
    const response = await fetch('questions.json'); // Fetch the JSON file
    const allQuestions = await response.json();
    shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 2); // Shuffle and select 10 questions
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

// Start the game
function startGame() {
  startButton.classList.add('hide');
  highScoreContainer.classList.add('hide');
  currentQuestionIndex = 0;
  score = 0;
  questionContainerElement.classList.remove('hide');
  resultContainer.classList.add('hide');
  setNextQuestion();
}

// Set and display the next question
function setNextQuestion() {
  resetState();
  startTimer();
  showQuestion(shuffledQuestions[currentQuestionIndex]);
}

// Display the question and answers
function showQuestion(question) {
  questionElement.innerText = question.question;

  // Shuffle the answers array
  const shuffledAnswers = question.answers.sort(() => Math.random() - 0.5);

  shuffledAnswers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn');
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
    answerButtonsElement.appendChild(button);
  });
}


// Clear previous question and answers
function resetState() {
  clearStatusClass(document.body);
  nextButton.classList.add('hide');
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
  clearInterval(timerInterval);
  timerElement.innerText = '';
  timerSound.pause();
}

// Start the countdown timer for the current question
function startTimer() {
  let timeLeft = 15;
  timerSound.currentTime = 0;
  timerSound.play();

  timerInterval = setInterval(() => {
    timerElement.innerText = timeLeft;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timerSound.pause();
      handleTimeExpired();
    }
  }, 1000);
}

// Handle when the user selects an answer
function selectAnswer(e) {
  clearInterval(timerInterval);
  timerSound.pause();
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct;

  if (correct) {
    correctSound.play();
    score++;
  } else {
    wrongSound.play();
  }

  setStatusClass(document.body, correct);
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct);
  });
  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide');
  } else {
    alert('The quiz is complete!');
    displayResults();
  }
}


function handleTimeExpired() {
  const correctAnswerButton = Array.from(answerButtonsElement.children).find(button => button.dataset.correct === 'true');
  if (correctAnswerButton) correctAnswerButton.classList.add('correct');

  wrongSound.play();

  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide');
  } else {
    alert('Time is up! The quiz is complete.');
    displayResults();
  }
}

// Display the results and feedback
async function displayResults() {
  questionContainerElement.classList.add('hide');
  resultContainer.classList.remove('hide');

  completionSound.play();

  const totalQuestions = shuffledQuestions.length;
  const percentage = (score / totalQuestions) * 100;
  let message = '';

  if (percentage > 80) {
    message = 'Excellent';
  } else if (percentage >= 50) {
    message = 'Well done';
  } else if (percentage >= 30) {
    message = 'Try Again ';
  } else {
    message = 'Fail';
  }

  saveHighScore(userName, score, percentage);

  resultContainer.innerHTML = `
    <h2>Quiz Results</h2>
    <p>Name: ${userName}</p>
    <p>Score: ${score} / ${totalQuestions}</p>
    <p>Percentage: ${percentage.toFixed(2)}%</p>
    <p>Feedback: ${message}</p>
    <button onclick="showHighScores()">View High Scores</button>
    <button onclick="location.reload()">Restart Quiz</button>
  `;
}

// Save the high score to local storage
async function saveHighScore(name, score, percentage) {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push({ name, score, percentage });
  highScores.sort((a, b) => b.score - a.score);
  localStorage.setItem('highScores', JSON.stringify(highScores));
  const package = {highScores}
  const options = {
    method : 'POST',
    header : {
      'Content-Type' : 'application/json'
    },
    body:JSON.stringify(package)
  }
 const response = await fetch ('/quizz',options);
 const data = await response.json()
 console.log(data)

}

// Display the high scores
function showHighScores() {
  resultContainer.classList.add('hide');
  highScoreContainer.classList.remove('hide');

  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScoreContainer.innerHTML = `
    <h2>High Scores</h2>
    <ol>
      ${highScores.map(score => `<li>${score.name}: ${score.score} (${score.percentage.toFixed(2)}%)</li>`).join('')}
    </ol>
    <button onclick="location.reload()">Restart Quiz</button>
  `;
}

// Set the status class on an element
function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('correct');
  } else {
    element.classList.add('wrong');
  }
}

// Clear the status classes from an element
function clearStatusClass(element) {
  element.classList.remove('correct');
  element.classList.remove('wrong');
}
