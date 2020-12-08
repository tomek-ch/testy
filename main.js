let questions = [];
let currentQuestion = 0;
let userAnswers = {};
let testEnded = false;

function selectAnswer(answer) {
    userAnswers[currentQuestion] = answer;
    nextQuestion();
}

function renderAnswers(answers) {
    const curr = questions[currentQuestion];
    const answerElements = document.createElement('div');
    answerElements.classList.toggle('answers');

    answers.forEach(answer => {
        const label = document.createElement('label');
        label.classList.toggle('answer');
        label.htmlFor = answer;

        if (testEnded) {
            if (answer === questions[currentQuestion]['Poprawna odp']) {
                label.classList.toggle('right');
            } else {
                label.classList.toggle('wrong');
            }
        }

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = answer;
        radio.name = 'answer';
        radio.id = answer;
        radio.disabled = testEnded;
        radio.addEventListener('click', () => selectAnswer(answer));
        if (userAnswers[currentQuestion] === answer) {
            radio.checked = true;
        }

        const labelText = document.createTextNode(curr[`Odpowiedź ${answer}`] || answer);

        label.appendChild(radio);
        label.appendChild(labelText);

        answerElements.appendChild(label);
    });
    document.querySelector('#current-question').appendChild(answerElements);
}

function selectQuestion(idx) {
    currentQuestion = idx;
    displayQuestion();
}

function renderThumbnails() {
    const thumbnails = document.createElement('div');
    thumbnails.classList.toggle('thumbnails');

    questions.forEach((_question, idx) => {
        const thumbnail = document.createElement('button');
        thumbnail.classList.toggle('thumbnail');
        thumbnail.textContent = idx + 1;
        
        if (currentQuestion === idx) {
            thumbnail.classList.toggle('active-thumbnail');
        }
        if (testEnded) {
            if (userAnswers[idx] === questions[idx]['Poprawna odp']) {
                thumbnail.classList.toggle('right');
            } else {
                thumbnail.classList.toggle('wrong');
            }
        } else if (userAnswers[idx]) {
            thumbnail.classList.toggle('answered-thumbnail');
        }

        thumbnail.addEventListener('click', () => selectQuestion(idx));
        thumbnails.appendChild(thumbnail);
    });

    document.querySelector('#current-question').appendChild(thumbnails);
}

function nextQuestion() {
    if (currentQuestion + 1 < questions.length) {
        selectQuestion(currentQuestion + 1);
    } else {
        displayQuestion();
    }
}

function prevQuestion() {
    if (currentQuestion - 1 >= 0) {
        selectQuestion(currentQuestion - 1);
    }
}

function endTest() {
    testEnded = true;
    let correctAnswers = 0;
    let maxScore = 0;

    const score = questions.reduce((acc, curr, idx) => {
        const points = parseInt(curr['Liczba punktów']);
        maxScore += points;

        if (curr['Poprawna odp'] == userAnswers[idx]) {
            correctAnswers++;
            return acc + points;
        } else {
            return acc;
        }
    }, 0);

    displayQuestion();

    document.querySelector('#score').textContent =`Odpowiedziałeś poprawnie na ${correctAnswers} pytań z ${questions.length} i zdobyłeś ${score} na ${maxScore} punktów.`;

    document.querySelector('#restart-button').classList.toggle('hidden');
}

function displayQuestion() {
    document.querySelector('#current-question').textContent = '';
    const curr = questions[currentQuestion];

    const questionElement = document.createElement('div');
    questionElement.textContent = curr.Pytanie;
    document.querySelector('#current-question').appendChild(questionElement);

    if (curr['Odpowiedź A']) {
        renderAnswers(['A', 'B', 'C']);
    } else {
        renderAnswers(['T', 'N']);
    }

    const prevBtn = document.createElement('button');
    prevBtn.addEventListener('click', prevQuestion);
    prevBtn.textContent = 'Poprzednie pytanie';
    document.querySelector('#current-question').appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.classList.toggle('next-btn');
    nextBtn.addEventListener('click',
        currentQuestion === questions.length - 1 ? endTest : nextQuestion);
    nextBtn.textContent = currentQuestion === questions.length - 1 ? 'Zakończ test' : 'Następne pytanie';
    document.querySelector('#current-question').appendChild(nextBtn);

    renderThumbnails();
}

async function getQuestions(e) {
    e.preventDefault();
    
    document.querySelector('#test-config').classList.toggle('hidden');
    testEnded = false;

    questions = JSON.parse(await (await fetch('questions.php', {
        method: 'POST',
        body: new FormData(e.target),
    })).text());

    displayQuestion();
}

function restart() {
    questions = [];
    userAnswers = {};
    currentQuestion = 0;

    document.querySelector('#current-question').textContent = '';
    document.querySelector('#score').textContent = '';

    document.querySelector('#restart-button').classList.toggle('hidden');
    document.querySelector('#test-config').classList.toggle('hidden');
}

document.querySelector('#test-config').addEventListener('submit', getQuestions);
document.querySelector('#restart-button').addEventListener('click', restart);