let clientId; // Optional String
let roomId; // Optional int
let admin; // Optional bool
let number; // Optional int

function build() {
	if (!clientId) {
		document.getElementsByTagName("body")[0].innerHTML = "registering";
	} else if (!roomId) {
		document.getElementsByTagName("body")[0].innerHTML = `
			<button type="button" onclick="createRoom();">Create Room!</button><br><br>
			<input type="text" id="roomId" name="roomId">
			<button type="button" onclick="joinRoom();">Join Room!</button>
		`;
	} else {
		document.getElementsByTagName("body")[0].innerHTML = `
			In Room ${String(roomId).padStart(4, "0")}
		`;
	}
}

async function register() {
	while (clientId == null) {
		const client = new Parse.Object("Client");
		try {
			const result = await client.save();
			clientId = result.id;
		} catch (error) {
			console.log("register: Error while saving client: " + error.message);
		}
	}
}

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

async function createRoom() {
	if (!clientId) {
		return false;
	}

	let newRoomId = randomInt(1000);
	const client = new Parse.Object("Client");
	client.set("objectId", clientId);
	client.set("room", newRoomId);
	client.set("admin", true);
	try {
		const result = await client.save();
		roomId = newRoomId;
		build();
	} catch (error) {
		console.log("register: Error while saving new room ID for client: " + error.message);
	}
}

async function joinRoom() {
	if (!clientId) {
		return false;
	}

	let newRoomId = parseInt(document.getElementById("roomId").value);
	if (isNaN(newRoomId) || newRoomId < 0 || newRoomId > 9999) {
		alert("Room ID must be a four digit number.");
		return false;
	}

	const query = new Parse.Query("Client");
	query.equalTo("room", newRoomId);
	const count = await query.count();
	if (isNaN(count) || count <= 0) {
		alert("Room with given ID does not exist.");
		return false;
	}

	const client = new Parse.Object("Client");
	client.set("objectId", clientId);
	client.set("room", newRoomId);
	client.set("admin", false);
	try {
		const result = await client.save();
		roomId = newRoomId;
		build();
	} catch (error) {
		console.log("register: Error while saving new room ID for client: " + error.message);
	}
}

window.onload = async function() {
	build();

	Parse.initialize(
		"DoB8Ae8hYagGECfghLFLqAhg2l1Qozf27GPQYOU2",
		"eY38F5B5VC8JiQs8gOyywouzNANnYpBMnsnwF2Lm"
	);
	Parse.serverURL = 'https://parseapi.back4app.com/'

	await register();
	console.log("Registered as " + clientId);

	build();
}

window.onbeforeunload = async function(event) {
	if (clientId != null) {
		const client = new Parse.Object("Client");
		client.set("objectId", clientId);
		await client.destroy();
	}
	// Prevent "Leave site?" popup from being shown and simply exit.
	event.returnValue = false;
	return false;
}
