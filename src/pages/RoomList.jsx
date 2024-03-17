import React from "react";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import AuthContext from "../assets/Contexts/AuthContext.jsx";
import axios from "axios";
import { ButtonThemes } from "../assets/themes/Buttons.js";

const RoomList = () => {
  const navigate = useNavigate();
  const { socket, user, BaseUrl } = useContext(AuthContext);
  const [roomList, setRoomList] = useState([]);
  const [room, setRoom] = useState("");
  const [scores, setScores] = useState([]);

  const joinRoom = (roomNumber) => {
    navigate(`room/${roomNumber}`);
  };

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await BaseUrl.get(`/room/${user.class}`);
        setRoomList(response.data.rooms);
        const score = await BaseUrl.get(`/getScore/${user.class}`);
        setScores(score.data.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    }

    fetchRooms();
    socket.on("room-info", (data) => {
      if (data.success) {
        navigate(`/room/${data.room}`);
      } else {
        alert(data.message);
      }
    });

    socket.on("get-score", (data) => {
      const { score } = data;
      setScores(score);
    });

    return () => {
      setRoom(null);
    };
  }, [socket, navigate, BaseUrl, user]);

  return (
    <div className="container p-4 flex h-screen">
      <div className="flex flex-wrap h-fit flex-row w-3/5">
        {roomList.map((data) => (
          <div key={data.id} className="button h-fit basis-1/5 flex-none mb-3">
            <Button
              theme={ButtonThemes}
              color={data.isFull ? "red" : "dark"}
              onClick={() => joinRoom(data.id)}
            >
              Join Room {data.name}
            </Button>
          </div>
        ))}
      </div>
      <div className="leaderboard ms-6 w-2/5">
        <div className="container">
          <h1 className="text-lg font-semibold text-blue-600 mb-5">
            Leaderboard
          </h1>
          <div className="border-2 border-purple-500 rounded-md w-full p-3">
            {scores.length > 0 ? (
              scores.map((score, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-3"
                >
                  <div className="name">{score.User.name}</div>
                  <div className="score text-blue-700 font-semibold">
                    {score.score}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">Score Empty</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
