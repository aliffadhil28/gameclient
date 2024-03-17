import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, redirect } from "react-router-dom";
import { Button, TextInput } from "flowbite-react";
import AuthContext from "../assets/Contexts/AuthContext.jsx";
import $ from "jquery";

const Room = () => {
  const { socket, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { room } = useParams();
  const [users, setUsers] = useState([]);
  const [nim, setNim] = useState(user.nim);
  const [yourAnswers, setYourAnswers] = useState([]);
  const [oppAnswers, setOppAnswers] = useState([]);
  const [yourScore, setYourScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [countingDown, setCountingDown] = useState(false);
  const [timer, setTimer] = useState(10);
  const [round, setRound] = useState(1);
  const [ready, setReady] = useState(false);
  const [end, setEnd] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false); // State untuk mengatur status tombol

  const submitReady = () => {
    if (nim !== null || nim !== undefined) {
      socket.emit("join_room", { room: room, nim: nim });
    } else {
      navigate("/login");
    }
  };

  const sendAnswer = (answer) => {
    setAnswerSubmitted(true);
    setButtonDisabled(true);
    socket.emit("send-answer", { answer: answer, room: room, nim: nim });
  };

  useEffect(() => {
    socket.on("room-info", (data) => {
      const { players, success } = data;
      if (!success) {
        alert('Room is Full')
        setTimeout(()=>{
          window.location.href = '/'
        },3000)
      }
      setUsers(players);
      let opponentId = players.find((player) => player !== nim);
      if (opponentId === undefined && players.length > 0) {
        opponentId = players[0];
      }
      setOpponent(opponentId);
    });

    socket.on("player-ready", (data) => {
      const { ready } = data;
      if (ready) {
        setReady(true);
      }else{
        alert('Anda sudah pernah melawan musuh ini sebelumnya')
        setTimeout(()=>{
          window.location.href = '/'
        },3000)
      }
    });

    socket.on("match-results", (data) => {
      const { answers } = data;
      const [userAnswer, opponentAnswer] = answers.slice(-2);

      let yourAnswer, oppAnswer;
      if (userAnswer[0] === nim) {
        yourAnswer = userAnswer[1];
        oppAnswer = opponentAnswer[1];
      } else {
        yourAnswer = opponentAnswer[1];
        oppAnswer = userAnswer[1];
      }

      setYourAnswers((prevAnswers) => [...prevAnswers, yourAnswer]);
      setOppAnswers((prevAnswers) => [...prevAnswers, oppAnswer]);

      let yourNewScore = yourScore;
      let oppNewScore = oppScore;

      if (oppAnswer === "setuju" && yourAnswer === "setuju") {
        yourNewScore += 3;
        oppNewScore += 3;
      } else if (oppAnswer === "khianat" && yourAnswer === "khianat") {
        yourNewScore += 1;
        oppNewScore += 1;
      } else if (oppAnswer === "khianat" && yourAnswer === "setuju") {
        oppNewScore += 5;
      } else if (yourAnswer === "khianat" && oppAnswer === "setuju") {
        yourNewScore += 5;
      }

      setYourScore(yourNewScore);
      setOppScore(oppNewScore);

      console.log("Your answer:", yourAnswer);
      console.log("Opponent's answer:", oppAnswer);
    });

    socket.on("match-end", (data) => {
      const { end } = data;
      setEnd(true);
      if (end) {
        setTimeout(() => {
          socket.emit("leave-room", { room: room, nim: nim });
          redirect('/')
        }, 3000);
      }
    });

    return () => {
      socket.off("room-info");
      socket.off("match-results");
      socket.off("player-ready");
    };
  }, [
    nim,
    oppScore,
    yourScore,
    room,
    timer,
    round,
    socket,
    navigate,
    answerSubmitted,
    end,
    ready,
    user
  ]);

  // Mengaktifkan kembali tombol saat countdown mencapai 0
  useEffect(() => {
    
    if (timer == 10) {
      setButtonDisabled(false);
    }
    
    if (!answerSubmitted && timer == 0) {
      $("#setuju").click();
    } else {
      setAnswerSubmitted(false);
    }
    
    if (ready) {
      setCountingDown(true);
      $("#timer").addClass("animate-ping");
      const countdownInterval = setInterval(() => {
        if (timer !== 0 && round < 11) {
          setTimer(timer - 1);
        } else if (timer == 0) {
          setTimer(10);
          setCountingDown(true);
          setRound((prevRound) => prevRound + 1);
        } else {
          clearInterval(countdownInterval);
          setCountingDown(false);
          alert("Game is finish");
        }
      }, 1000);
      if (end) {
        clearInterval(countdownInterval);
        setCountingDown(false);
        setRound(1)
        $('#timer').removeClass('animate-ping')
        alert("Game is finish");
        setTimeout(()=>{
          socket.emit('final-score',{userId : user.id,finalScore : yourScore,room : room,cls :user.class})
        },2000)
      }
      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [timer, answerSubmitted, round,end,ready,room,socket,user,yourScore]);

  return (
    <div className="p-3">
      <div className="flex justify-between">
        <div className="you">
          <p className="text-3xl">You</p>
          <p className="text-green-600">{nim}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-3xl text-green-600">{yourScore}</div>
          <div className="text-4xl mx-6 flex flex-col">
            <p className="mb-1">Round</p>
            <p className="text-orange-600 mx-auto">{round}</p>
          </div>
          <div className="text-3xl text-purple-600">{oppScore}</div>
        </div>
        <div className="you">
          <p className="text-3xl">Opponent</p>
          <p className="text-purple-600">{opponent}</p>
        </div>
      </div>
      <div className="box-game border-4 flex flex-col mx-10 my-5 rounded-md py-10">
        <h1 id="timer" className="text-2xl text-red-600 mx-auto mb-2">
          {timer}
        </h1>
        <p className="text-xl mb-3 mx-auto">Choose your answer</p>
        <div className="flex justify-evenly">
          <Button
            id="setuju"
            onClick={() => sendAnswer("setuju")}
            disabled={buttonDisabled}
          >
            Setuju
          </Button>
          <Button
            id="khianat"
            onClick={() => sendAnswer("khianat")}
            disabled={buttonDisabled}
          >
            Khianat
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        {ready ? (
          <p>Answer before time is up !!</p>
        ) : (
          <Button onClick={submitReady}>Ready</Button>
        )}
      </div>
      <div className="flex justify-evenly">
        <div className="flex flex-col">
          <p className="text-xl mb-1">Your Answers</p>
          {yourAnswers.map((answer, index) => (
            <p key={index} className="text-green-600">
              {answer}
            </p>
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-xl mb-1">Opponent`s Answers</p>
          {oppAnswers.map((answer, index) => (
            <p key={index} className="text-purple-600">
              {answer}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
