const messages = document.querySelector(".chat-messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Emit username and room
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("message", input.value);
    input.value = "";
    input.focus();
  }
});

// Broadcast when user connects or disconnects
socket.on("broadcast", function (msg) {
  const div = document.createElement("div");
  div.classList.add("broadcast-message");
  div.innerHTML = `<p class="text">${msg}</p>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// Emit chat messages
socket.on("message", function (msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">${msg.text}</p>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// Add room name
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users
function outputUsers(users) {
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
