'use strict';

//constants
const totalQuestions = 5;
const base_url = `https://opentdb.com/api.php?amount=${totalQuestions}`;

//global variables
let url; //send fetch request to this url
let counter;
let score;
let correct;
let questions;

//get DOM elements
const cards = document.querySelectorAll('.card');
const categoryCard = cards[0];
const questionCard = cards[1];
const skeletonCard = cards[2];
const scoreCard = cards[3];

const categoryElements = Array.from(document.querySelectorAll('.category-item'));
const playBtn = document.querySelector('button');
const submitBtn = questionCard.querySelector('button');
const playAgainBtn = scoreCard.querySelector('button');
const questionHeaders = questionCard.querySelectorAll('span');
const questionText = questionCard.querySelector('.question-text');
const questionBody = questionCard.querySelector('.card-body');
const scoreElements = scoreCard.querySelectorAll('.stat');


categoryElements.forEach(item => item.addEventListener('click', clickCategory));

function clickCategory(e) {
    e.target.classList.toggle('selected');
    categoryElements.forEach(item => {
        if (item.classList.contains('selected') && item !== e.target)
            item.classList.remove('selected');
    });
}

playBtn.addEventListener('click', initGame);

function initGame() {
    //reset global variables
    counter = 0;
    score = 0;
    correct = 0;
    questions = [];
    url = base_url;

    /*  Write down your code here to update the URL according to selected category,
        hide the category card and show the skeleton card.

        Then call the getQuestions function to move on

        If the user doesn't select any category, show an alert to choose a category    
    */
    // Check if a category is selected

    // Check if a category is selected
    const selectedCategory = categoryElements.find(item => item.classList.contains('selected'));

    if (selectedCategory) {
        // Update URL based on selected category
        url = `${base_url}&category=${selectedCategory.dataset.category}`;

        // Hide the category card and show the skeleton card
        categoryCard.classList.add('hidden');
        skeletonCard.classList.remove('hidden');

        // Call getQuestions function to proceed
        getQuestions(url);
    } else {
        // Show alert if no category is selected
        alert('Please choose a category.');
    }
}

async function getQuestions() {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw Error(`Error: ${response.url} ${response.statusText}`);
        const data = await response.json();
        if (data.response_code === 0) {
            /*
                Write your code here to process the data and then show the questions.

                Hint: you can call the other functions to do that
            */
            processQuestions(data.results);
            showQuestions();
        }
        else {
            throw Error('Error: Cannot fetch questions from the API');
        }
    } catch (error) {
        console.log(error);
    }
}

function processQuestions(data) {
    /*
        Write your code here to process the json data to populate the global variable "questions" so that
        it contains the necessary information such as, the question itself, difficulty level, answers, correct answers.

        Hint: Create a question object and populate its properties (text, level, answers, correctAnswer) and then just push that object to the global variable
        "questions"

        Make sure to add the correct answer to the choices at random location so that it is not always the same index
        for the right answer.
    */
    questions = [];

    data.forEach((item) => {
        const question = {
            text: item.question,
            level: item.difficulty,
            answers: [],
            correctAnswer: 0 // Default correct answer index
        };

        // Populate answers array with incorrect answers
        item.incorrect_answers.forEach((answer) => {
            question.answers.push(answer);
        });

        // Generate random index to insert correct answer
        const correctIndex = Math.floor(Math.random() * (question.answers.length + 1));
        question.answers.splice(correctIndex, 0, item.correct_answer);

        // Update correctAnswer index based on the random insertion
        question.correctAnswer = correctIndex;

        // Push question object to global questions array
        questions.push(question);
    });
}

function showQuestions() {
    submitBtn.disabled = false;
    let optionElements = questionCard.querySelectorAll('.option-item');
    optionElements.forEach(element => element.remove());

    const question = questions[counter];
    questionHeaders[0].textContent = `Question: ${counter + 1} / ${totalQuestions}`;
    questionHeaders[1].textContent = `Level: ${question.level}`;
    questionHeaders[2].textContent = `Score: ${score}`;
    questionText.innerHTML = question.text;
    const fragment = document.createDocumentFragment();
    question.answers.forEach(answer => {
        const option = document.createElement('div');
        option.innerHTML = answer;
        option.classList.add('option-item');
        fragment.append(option);
    });

    questionBody.insertBefore(fragment, submitBtn);
    skeletonCard.classList.add('hidden');
    questionCard.classList.remove('hidden');

    optionElements = questionCard.querySelectorAll('.option-item');
    optionElements.forEach(item => item.addEventListener('click', e => {
        optionElements.forEach(element => {
            if (element.classList.contains('selected'))
                element.classList.remove('selected');
        });

        e.target.classList.add('selected');
    }));
}

submitBtn.addEventListener('click', submitAnswer);

function submitAnswer() {
    submitBtn.disabled = true;
    const answerSubmitted = questionBody.querySelector('.selected');
    const allAnswers = questionBody.querySelectorAll('.option-item');
    const correctAnswer = allAnswers[questions[counter].correctAnswer];

    correctAnswer.classList.add('correct');


    /*
        Write your code here to check if the user submitted any answer or not. Verify the user's submitted answer and if it is correct, update necessary
        variables. If incorrect, add 'wrong' class to the class list of 'answerSubmitted' 

        Also, set a timeout for 1.5s and call the nextQuestion() function
    */
    if (answerSubmitted) {
        if (answerSubmitted === correctAnswer) {
            // Correct Answer
            correct++;
            const currentQuestion = questions[counter];
            const difficulty = currentQuestion.level;

            // Update score based on difficulty level
            switch (difficulty) {
                case 'easy':
                    score += 10;
                    break;
                case 'medium':
                    score += 20;
                    break;
                case 'hard':
                    score += 30;
                    break;
                default:
                    break;
            }

            answerSubmitted.classList.add('correct');
        } else {
            // Incorrect Answer
            answerSubmitted.classList.add('wrong');
        }
    } else {
        // No answer submitted (timeout scenario)
        correctAnswer.classList.add('correct'); // Highlight correct answer
    }

    // Set a timeout to move to the next question after 1.5 seconds
    setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
    counter++;

    if (counter < totalQuestions)
        showQuestions();
    else
        showScore();
}

function showScore() {
    scoreElements[0].textContent = `Correct Answers: ${correct}`;
    scoreElements[1].textContent = `Score: ${score}`;

    questionCard.classList.add('hidden');
    scoreCard.classList.remove('hidden');
}

playAgainBtn.addEventListener('click', () => {

    /*
        Write your code here to implement the Play Again button
    */
    counter = 0;
    score = 0;
    correct = 0;
    questions = [];
    url = base_url;

    scoreCard.classList.add('hidden');
    categoryCard.classList.remove('hidden');
    categoryElements.forEach(item => item.classList.remove('selected'));
    playBtn.disabled = false;

    questionCard.classList.add('hidden');
    skeletonCard.classList.add('hidden');
    let optionElements = questionCard.querySelectorAll('.option-item');
    optionElements.forEach(element => element.remove());

    scoreElements[0].textContent = `Correct Answers: 0`;
    scoreElements[1].textContent = `Score: 0`;
    questionHeaders[0].textContent = '';
    questionHeaders[1].textContent = '';
    questionHeaders[2].textContent = '';

    submitBtn.disabled = false;
    window.scrollTo(0, 0);
    questions = [];
    url = base_url;
});
