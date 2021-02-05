characters = [
	{"name": "Tyrion Lannister",
	"status": "Alive",
	"house": "Lannister",
	"house_affiliations": ["targaryen"],
	"probability_of_survival": 95,
	"current_location": "Casterly Rock"},
	
	{"name": "Jon Snow",
	"status": "Alive",
	"house": "Stark",
	"house_affiliations": ["targaryen"],
	"probability_of_survival": 99,
	"current_location": "Haunted Forest"},

	{"name": "Podrick Payne",
	"status": "Alive",
	"house": "Payne",
	"house_affiliations": ["stark", "lannister"],
	"probability_of_survival": 80,
	"current_location": "King's Landing"},

	{"name": "Sansa Stark",
	"status": "Alive",
	"house": "Stark",
	"house_affiliations": ["targaryen", "bolton", "lannister"],
	"probability_of_survival": 70,
	"current_location": "Winterfell"}
]

function halfSurvival(character) {
	half = character.probability_of_survival / 2;
	return half;
}

for (var i = 0; i < characters.length; i++) {
	if (characters[i].name != "Tyrion Lannister") characters[i].probability_of_survival = halfSurvival(characters[i]);
}

function debugCharacters() {
	for (var i = 0; i < characters.length; i++) {
		console.log(characters[i].name + ": " + characters[i].probability_of_survival);
	}
}

// document is the DOM, select the #main div
var main = document.getElementById("main");

var grid = document.getElementById("grid-container");

function displayCharacters() {
	for (var i = 0; i < characters.length; i++) {
		var div =  document.createElement("div");
		grid.appendChild(div);
		var name = document.createElement("h4");
		name.textContent = characters[i].name;
		var house = document.createElement("p");
		house.textContent = "House " + characters[i].house;
		var survival = document.createElement("p");
		survival.textContent = "Probability of survival: " + characters[i].probability_of_survival + "%";
		var status = document.createElement("p");
		status.textContent = "Status: " + characters[i].status;
		div.append(name, house, survival, status);
	}
}

displayCharacters();
