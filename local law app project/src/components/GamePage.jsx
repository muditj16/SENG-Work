import {
  CheckCircle,
  Gamepad2,
  Play,
  RotateCcw,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Quiz questions about local laws
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "What is the minimum age requirement for wearing a bicycle helmet in most municipalities?",
    options: [
      "Under 16 years old",
      "Under 18 years old",
      "Under 21 years old",
      "All ages",
    ],
    correctAnswer: 1,
    explanation:
      "In most BC municipalities, cyclists under 18 must wear approved helmets.",
  },
  {
    id: 2,
    question:
      "What is the typical speed limit in school zones during school hours?",
    options: ["25 km/h", "30 km/h", "35 km/h", "40 km/h"],
    correctAnswer: 1,
    explanation:
      "School zones typically have a 30 km/h speed limit during school hours.",
  },
  {
    id: 3,
    question: "When must business licenses typically be renewed?",
    options: [
      "Every 6 months",
      "Annually by December 31st",
      "Every 2 years",
      "Only when requested",
    ],
    correctAnswer: 1,
    explanation:
      "Most business licenses must be renewed annually before December 31st.",
  },
  {
    id: 4,
    question:
      "What is the maximum noise level for commercial activities in residential areas at night?",
    options: ["45 dB", "50 dB", "55 dB", "60 dB"],
    correctAnswer: 2,
    explanation:
      "Commercial activities typically cannot exceed 55 dB between 10 PM and 7 AM in residential areas.",
  },
  {
    id: 5,
    question: "Where are motor vehicles prohibited from stopping or parking?",
    options: [
      "Residential driveways",
      "Designated bike lanes",
      "Shopping mall parking lots",
      "Private property",
    ],
    correctAnswer: 1,
    explanation:
      "Motor vehicles are prohibited from stopping or parking in designated bike lanes.",
  },
];

function GamePage() {
  const [gameState, setGameState] = useState("menu"); // 'menu', 'playing', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [userAnswers, setUserAnswers] = useState([]);

  const startQuiz = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore({ correct: 0, incorrect: 0 });
    setUserAnswers([]);
  };

  const selectAnswer = (answerIndex) => {
    if (showFeedback) return; // Prevent changing answer after feedback
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = QUIZ_QUESTIONS[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update score
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Store user answer
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        question: question.question,
        correctAnswer: question.options[question.correctAnswer],
        selectedAnswerText: question.options[selectedAnswer],
      },
    ]);

    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameState("results");
    }
  };

  const resetQuiz = () => {
    setGameState("menu");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore({ correct: 0, incorrect: 0 });
    setUserAnswers([]);
  };

  const currentQuestionData = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  if (gameState === "menu") {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Law Games</h1>
        </div>

        <div className="container">
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ marginBottom: "2rem" }}>
              <Trophy size={64} color="var(--primary-color)" />
            </div>

            <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
              Local Law Quiz
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "2rem",
                lineHeight: 1.6,
              }}
            >
              Test your knowledge of local laws with our interactive quiz!
              Answer {QUIZ_QUESTIONS.length} questions and see how well you know
              your local regulations.
            </p>

            <button
              className="btn btn-primary"
              onClick={startQuiz}
              style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}
            >
              <Play size={20} style={{ marginRight: "0.5rem" }} />
              Start Quiz
            </button>

            {/* Other Games - Coming Soon */}
            <div style={{ marginTop: "3rem" }}>
              <h3
                style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}
              >
                More Games Coming Soon
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="card" style={{ opacity: 0.6 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Star size={24} color="var(--success)" />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        Scenario Builder
                      </h4>
                      <p
                        style={{
                          margin: "0.25rem 0 0 0",
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Learn through real-world scenarios
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ opacity: 0.6 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Gamepad2 size={24} color="var(--primary-color)" />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        Law Memory Game
                      </h4>
                      <p
                        style={{
                          margin: "0.25rem 0 0 0",
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Match laws with their descriptions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Quiz Question {currentQuestion + 1}</h1>
          <div className="quiz-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>
        </div>

        <div className="container">
          <div className="quiz-container">
            <div className="quiz-question">
              <h2>{currentQuestionData.question}</h2>
            </div>

            <div className="quiz-options">
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${
                    selectedAnswer === index ? "selected" : ""
                  } ${
                    showFeedback
                      ? index === currentQuestionData.correctAnswer
                        ? "correct"
                        : selectedAnswer === index
                        ? "incorrect"
                        : ""
                      : ""
                  }`}
                  onClick={() => selectAnswer(index)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                  {showFeedback &&
                    index === currentQuestionData.correctAnswer && (
                      <CheckCircle size={20} color="var(--success)" />
                    )}
                  {showFeedback &&
                    selectedAnswer === index &&
                    index !== currentQuestionData.correctAnswer && (
                      <XCircle size={20} color="var(--error)" />
                    )}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="quiz-feedback">
                <div
                  className={`feedback-message ${
                    selectedAnswer === currentQuestionData.correctAnswer
                      ? "correct"
                      : "incorrect"
                  }`}
                >
                  {selectedAnswer === currentQuestionData.correctAnswer ? (
                    <div>
                      <CheckCircle size={24} />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div>
                      <XCircle size={24} />
                      <span>Incorrect</span>
                    </div>
                  )}
                </div>
                <p className="feedback-explanation">
                  {currentQuestionData.explanation}
                </p>
              </div>
            )}

            <div className="quiz-actions">
              {!showFeedback ? (
                <button
                  className="btn btn-primary"
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </button>
              ) : (
                <button className="btn btn-primary" onClick={nextQuestion}>
                  {currentQuestion < QUIZ_QUESTIONS.length - 1
                    ? "Next Question"
                    : "View Results"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "results") {
    const percentage = Math.round(
      (score.correct / QUIZ_QUESTIONS.length) * 100
    );
    const passed = percentage >= 70;

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Quiz Results</h1>
        </div>

        <div className="container">
          <div className="results-container">
            <div className="results-header">
              <div className="results-icon">
                {passed ? (
                  <Trophy size={64} color="var(--success)" />
                ) : (
                  <Star size={64} color="var(--warning)" />
                )}
              </div>
              <h2 className="results-title">
                {passed ? "Congratulations!" : "Good Try!"}
              </h2>
              <div className="results-score">
                <span className="score-number">
                  {score.correct}/{QUIZ_QUESTIONS.length}
                </span>
                <span className="score-percentage">({percentage}%)</span>
              </div>
              <p className="results-message">
                {passed
                  ? "You have a great understanding of local laws!"
                  : "Keep learning about local laws to improve your knowledge!"}
              </p>
            </div>

            <div className="results-breakdown">
              <h3>Question Review</h3>
              {userAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`result-item ${
                    answer.isCorrect ? "correct" : "incorrect"
                  }`}
                >
                  <div className="result-header">
                    <span className="question-number">Q{index + 1}</span>
                    {answer.isCorrect ? (
                      <CheckCircle size={20} color="var(--success)" />
                    ) : (
                      <XCircle size={20} color="var(--error)" />
                    )}
                  </div>
                  <div className="result-content">
                    <p className="result-question">{answer.question}</p>
                    <p className="result-answer">
                      <strong>Your answer:</strong> {answer.selectedAnswerText}
                    </p>
                    {!answer.isCorrect && (
                      <p className="result-correct">
                        <strong>Correct answer:</strong> {answer.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="btn btn-primary" onClick={resetQuiz}>
                <RotateCcw size={20} style={{ marginRight: "0.5rem" }} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GamePage;
