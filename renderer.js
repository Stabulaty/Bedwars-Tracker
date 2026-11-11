const fs = require('node:fs');
let newsize = 0;
let oldsize = 0;
let erste_ausfuehrung = false;
let data;
let data_array = [];
let buffer;
let Zeile;
let Zeile2;
let chat_array = [];
let reines_chat_array = [];
let Party = [];
let temporaer_moderatoren = [];
let temporaer_mitglieder = [];
let Party_overall = new Set();
let Party_overall_array = [];
let Member_stats = {};
let Member_stats_sortiert = {};
let finals_lost = 0;
let Zeit_temporaer = [];
let Player_nicht_gejoint;
let l = 1;
let beds = false;
let n = 0;
let bed_color;
let final_color;
let naechstes = false;
let lost_color;
let z = 0;
let replay_mode = false;
let active = 0;
let prozess = false;
let pause = false;
let DEBUG = false;


function Main(pfad){
	//erste Ausführung (größe bisheriges Dokument feststellen, oldsize setzen, damit nur neues angezeigt wird)
	if (erste_ausfuehrung == false) {
		fs.open(pfad, (err, fd) => {
			if (err) {
				console.log(err);
			}
			size(fd, erste_ausfuehrung);
		})
	}

	function backup_plan(){
		fs.open(pfad, (err, fd) => {
			if (err) {
				console.log(err);
			}
			size(fd, erste_ausfuehrung);
		})
	};

	//Changes dokumentieren
	fs.watch(pfad, (eventType, filename) => {
		if (eventType == "change"){
			try {
					if (prozess == true){
							if (DEBUG) console.log("Array läuft noch durch den Code, neuer Inhalt wurde abgeblockt");
						return;
					}
					prozess = true;
						//active++;
						//console.time("Log Verarbeitung");
						//console.log(active);
				fs.open(pfad, (err, fd) => {
					if (err) {
						console.log(err);
					}
					size(fd);
				})	
			}	finally {
						prozess = false;
							//active--;
							//console.timeEnd("Log Verarbeitung");
			}
		}
		
	});

	//Dokmentgröße feststellen
	function size(fd, erste_ausfuehrung) {
		if (erste_ausfuehrung == false) {
			fs.fstat(fd, (err, stats) => {
				if (err) {
					console.log(err);
					backup_plan();
				}
				if (stats !== undefined){
					oldsize = stats.size;
					erste_ausfuehrung = true;
				}
			})
			fs.close(fd, (err) => {
				if (err) {
					console.log(err);
				}
			})
			return;
		}
		
		fs.fstat(fd, (err, stats) => {
			if (err) {
				console.log(err);
			}
				//console.log(stats.size);
			newsize = stats.size;
			lesen(newsize, fd);
			
		})
	}

	//Neue Daten auslesen
	function lesen(newsize, fd) {
		if (newsize < oldsize) {
				console.log("Neue Größe ist nicht größer");
				backup_plan();
				return;
		}
		
		let buffer = new Buffer.alloc(newsize - oldsize);  //Hier muss vllt +1 hin
		fs.read(fd, buffer, 0, newsize - oldsize, oldsize, (err, bytesRead, buffer) => {
			if (err) {
				console.log(err);
			}	
			
		oldsize = newsize;
		data = buffer.toString();
			//console.log(data);
		data_array = data.split("\n");
		data_array.splice(-1,1);
			//console.log(data_array);
		fs.close(fd, (err) => {
			if (err) {
				console.log(err);
			}
		});
		sortieren_nach_chat(data_array);
		})	
	}

	function sortieren_nach_chat(data_array) {
		let laenge = data_array.length;
		let k = 0
		chat_array = [];
		for (let i=0; i < laenge; i++) {
			Zeile = data_array[i];
			if (Zeile.includes("[CHAT]")) {
				//document.getElementById("Log_output").innerHTML += Zeile + '<br>';
				chat_array[k] = Zeile;
				k++;
			}
		}	
		
		if (chat_array.length > 0){
				//console.log(chat_array);
			saeubern(chat_array);
		}
	}


	function saeubern(chat_array){
		reines_chat_array = [];
		for (let i=0; i < chat_array.length; i ++){
			let index = chat_array[i].length;
			reines_chat_array[i] = chat_array[i].slice(40,index - 1); 
		}
		Party_Members(reines_chat_array);
	}


	function Party_Members (reines_chat_array) {
		if (reines_chat_array.length > 1){
			for (let i=0; i < reines_chat_array.length - 1; i ++){
				if (reines_chat_array[i] == '-----------------------------------------------------' && reines_chat_array[i+1].includes('Party Members') == true){
					Party = [];
					Party[Party.length] = reines_chat_array[i+3].slice(reines_chat_array[i+3].lastIndexOf("]") + 2, reines_chat_array[i+3].lastIndexOf("?") -1);
					if (reines_chat_array[i+5] != undefined && reines_chat_array[i+5].includes('Party Moderators')){
						temporaer_moderatoren = reines_chat_array[i+5].slice(reines_chat_array[i+5].lastIndexOf(":") + 2, reines_chat_array[i+5].length).split(' ? ');
							//console.log(temporaer_moderatoren);
						for (let i=0; i < temporaer_moderatoren.length - 1; i++){
							if (temporaer_moderatoren[i].includes("]")){
								Party[Party.length] = temporaer_moderatoren[i].slice(temporaer_moderatoren[i].lastIndexOf("]") + 2, temporaer_moderatoren[i].length);
							}
							else {
								Party[Party.length] = temporaer_moderatoren[i].slice(0, temporaer_moderatoren[i].length);
							}
						}
						temporaer_moderatoren = [];
					}
					else if (reines_chat_array[i+4] != undefined && reines_chat_array[i+4].includes('Party Members')){
							//console.log("Es gibt Mitglieder in i+4");
						temporaer_mitglieder = reines_chat_array[i+4].slice(reines_chat_array[i+4].lastIndexOf(":") + 2, reines_chat_array[i+4].length).split(' ? ');
						for (let i=0; i < temporaer_mitglieder.length - 1; i++){
								//console.log(i);
							if (temporaer_mitglieder[i].includes("]")){
								Party[Party.length] = temporaer_mitglieder[i].slice(temporaer_mitglieder[i].lastIndexOf("]") + 2, temporaer_mitglieder[i].length);
							}
							else {
								Party[Party.length] = temporaer_mitglieder[i].slice(0, temporaer_mitglieder[i].length);
							}
						}
						temporaer_mitglieder = [];
					}
					if (reines_chat_array[i+6] != undefined && reines_chat_array[i+6].includes('Party Members')){
							//console.log("Es gibt Mitglieder in i+6");
						temporaer_mitglieder= reines_chat_array[i+6].slice(reines_chat_array[i+6].lastIndexOf(":") + 2, reines_chat_array[i+6].length).split(' ? ');
						for (let i=0; i < temporaer_mitglieder.length - 1; i++){
								//console.log(i);
							if (temporaer_mitglieder[i].includes("]")){
								Party[Party.length] = temporaer_mitglieder[i].slice(temporaer_mitglieder[i].lastIndexOf("]") + 2, temporaer_mitglieder[i].length);
							}
							else {
								Party[Party.length] = temporaer_mitglieder[i].slice(0, temporaer_mitglieder[i].length);
							}
						}
						temporaer_mitglieder = [];
					}
					
					for (let i = 0; i < Party.length; i ++){
						Party_overall.add(Party[i]);
					}
					
					Party_overall_array = [...Party_overall];	//Array für daten array (immer gleich, ändert keine Positionen)
						if (DEBUG) console.log("Alle bisherigen Party Mitglieder: " + Party_overall_array);
						if (DEBUG) console.log("Aktuelle Party Mitglieder: " + Party);	//Array für Check, ob in aktueller Party (Position juckt)
					
					for (let i = 0; i < Party_overall_array.length; i++){
						if (Member_stats[Party_overall_array[i]]){
							if (DEBUG) console.log("Member wurde bereits erstellt: " + Party_overall_array[i]);
						}
							//console.log(Party_overall_array[i]);
						else {
							Member_stats[Party_overall_array[i]] = {
								finals: 0,
								session_finals: 0,
								beds: 0,
								session_beds: 0,
								final_deaths: 0,
							};
						};
					}
					Update_DOM(Member_stats, Party, finals_lost, beds);
					//console.log(Member_stats);
				}
			}
		}
		replay(reines_chat_array);
	}

	function replay(reines_chat_array){
		for (let h = 0; h < reines_chat_array.length; h++){
			if (reines_chat_array[h].trim() === "" && reines_chat_array[h].includes(":") == false && reines_chat_array.length > 20){
				let y = 0;
				for (let x = 1; x < 20; x++){
					if(reines_chat_array[x].trim() === "" && reines_chat_array[x].includes(":") == false){
						y++
					}
				}
				if (y == 19){
					if(reines_chat_array[h+20] == "????????????????????????????????????????" && reines_chat_array[h+20].includes(":") == false){
						replay_mode = true;
							if (DEBUG) console.log("Wir sind gerade im Replay");
					}
				}
				y = 0;
			}
			if (reines_chat_array[h].includes("seconds into the replay!") &&  reines_chat_array[h].includes(":") == false){
				replay_mode = true;
					if (DEBUG) console.log("Wir sind gerade im Replay");
			}
			

			if (replay_mode && reines_chat_array[h].trim() === "") {
				if (reines_chat_array[h-1] !== undefined && reines_chat_array[h-1].trim() !== "" && reines_chat_array[h+1] !== undefined && reines_chat_array[h+1].trim() !== ""){
					z++;
				}
				else if (reines_chat_array[h-1] == undefined && reines_chat_array[h+1] !== undefined && reines_chat_array[h+1].trim() !== ""){
					z++;
				}
				else if (reines_chat_array[h+1] == undefined && reines_chat_array[h-1] !== undefined && reines_chat_array[h-1].trim() !== ""){
					z++;
				}
				else if (reines_chat_array.length == 1) {
					z++
				}
			}
			
			if (z == 1){
				replay_mode = false;
					if (DEBUG) console.log("Replay wurde verlassen");	
				z = 0;
			}
		}
		Bed_Detection(reines_chat_array, replay_mode, pause);
	}

	function Bed_Detection (reines_chat_array, replay_mode, pause){
		if (replay_mode == false && pause == false){
			for (let element of reines_chat_array){
				if (element.includes(":") == false && element.includes("BED DESTRUCTION")){
						if (DEBUG) console.log("Es wurde ein Bett zerstört: " + element)
					for (let k = 0; k < Party.length; k++){
						if (element.includes(Party[k])) {
							Member_stats[Party[k]].beds ++;
							Member_stats[Party[k]].session_beds ++;
								if (DEBUG) console.log("Das Bett wurde von " + Party[k] + " zerstört. " + Party[k] + " hat jetzt " + Member_stats[Party[k]].beds + " Betten zerstört.");
							Update_DOM(Member_stats, Party, finals_lost, beds);
						}
					}
						console.log(Member_stats);
				}
			}
		}
		Final_Kill_Detection(reines_chat_array, replay_mode, pause);
	}


	function Final_Kill_Detection (reines_chat_array, replay_mode, pause){
		if (replay_mode == false && pause == false){
			for (let b = 0; b < reines_chat_array.length; b++){
				if (reines_chat_array[b].includes(":") == false && reines_chat_array[b].includes("FINAL KILL!")){
						if (DEBUG) console.log("Final Kill wurde erkannt");
					let hihi = reines_chat_array[b];
					if (Party.some(element => hihi.includes(element)) == false) {
						finals_lost ++;
							if (DEBUG) console.log("Final ist verloren gegangen: " + reines_chat_array[b] + ". Bisher verlorene Finals: " + finals_lost);
						Update_DOM(Member_stats, Party, finals_lost, beds);
					}
					
					for (let k = 0; k < Party.length; k++){
						if (reines_chat_array[b].indexOf(Party[k]) > 8) {
							Member_stats[Party[k]].finals ++;
							Member_stats[Party[k]].session_finals ++;
								if (DEBUG) console.log("Der Final gehört jemandem aus unserem Team: " + reines_chat_array[b] + ". " + Party[k] + " besitzt jetzt " + Member_stats[Party[k]].finals + " Finals.");
							Update_DOM(Member_stats, Party, finals_lost, beds);
						}
						else if (reines_chat_array[b].indexOf(Party[k]) > -1 && 3 > reines_chat_array[b].indexOf(Party[k])){
							Member_stats[Party[k]].final_deaths ++;
								if (DEBUG) console.log("Einer aus dem Team ist gestorben: " + reines_chat_array[b] + ". " + Party[k] + " hat jetzt " + Member_stats[Party[k]].final_deaths + " Final Deaths.");
							Update_DOM(Member_stats, Party, finals_lost, beds);
						}
					}
						if (DEBUG) console.log(Member_stats);
				}
			}
		}
		Zeitdinger(reines_chat_array);
		
	}


	function Zeitdinger (reines_chat_array){
		if (replay_mode == false && pause == false){
			for (let element of reines_chat_array){
				if (element.includes(":") == false && element.includes("The game starts in") && element.includes("seconds!")){
					for (let k = 0; k < Party.length; k++){
						Member_stats[Party[k]].finals = 0;
						Member_stats[Party[k]].beds = 0;
						finals_lost = 0;
						Update_DOM(Member_stats, Party, finals_lost, beds);
					}
				}
				if (element.includes(":") == false && element.includes("has joined (")){
					Zeit_temporaer = element.slice(element.indexOf("("), element.lastIndexOf(")")).split("/");
					Zeit_temporaer[0] = Zeit_temporaer[0].slice(1, Zeit_temporaer[0].length);
						//console.log(Zeit_temporaer[0]);
						//console.log(Zeit_temporaer[1]);
					Player_nicht_gejoint = Zeit_temporaer[1] - Zeit_temporaer[0];
						if (DEBUG) console.log("Es ist jemand beigetreten. Es fehlen noch " + Player_nicht_gejoint + " Spieler.");
				}
				if (element.includes(":") == false && element.includes("has quit")){
					Player_nicht_gejoint ++;
						if (DEBUG) console.log("Es hat jemand das Spiel verlassen. Es fehlen noch " + Player_nicht_gejoint + " Spieler.");
				}
				
				if (element.includes(":") == false && naechstes && element.includes("Bed Wars")){
					finals_lost = finals_lost + Player_nicht_gejoint;
						if (DEBUG) console.log("Das Spiel geht los. Es fehlen bis jetzt " + Player_nicht_gejoint + " Spieler.");
					Player_nicht_gejoint = 0;
					Update_DOM(Member_stats, Party, finals_lost, beds);
				}
				
				naechstes = false;
				
				if (element.includes(":") == false && element.includes("????????????????????????????????????????????????????????????????")){
					naechstes = true;
				}
			}
		}
		custom_commands(reines_chat_array);
	}
	
	function custom_commands(reines_chat_array){
		for (let i = 0; i < reines_chat_array.length; i++){
			if (reines_chat_array[i].includes('Unknown command. Type') && reines_chat_array[i].includes(":") == false){
				if (reines_chat_array[i].includes("tracker-reset")){
					for (let [Name, stats] of Object.entries(Member_stats)) {
						Member_stats[Name].finals = 0;
						Member_stats[Name].session_finals = 0;
						Member_stats[Name].beds = 0;
						Member_stats[Name].session_beds = 0;
						Member_stats[Name].final_deaths = 0;
						finals_lost = 0;
						Update_DOM(Member_stats, Party, finals_lost, beds);
					}
						if (DEBUG) console.log("Stats wurden resetet.");
				}
				if (reines_chat_array[i].includes("tracker-pause")){
					pause = true;
						if (DEBUG) console.log("Stat tracking ist momentan pausiert.");
					document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "<span style=color:red> Currently paused </span>";
				}
				if (reines_chat_array[i].includes("tracker-resume")){
					pause = false;
						if (DEBUG) console.log("Stat tracking wird wieder fortgeführt.")
					Update_DOM(Member_stats, Party, finals_lost, beds);
				}
			}
		}
		
	}

}

function Update_DOM(Member_stats, Party, finals_lost, beds){
		//console.time("DOM Update");
	document.getElementById("tabelle").innerHTML = "";
	n = 0;
	if (beds == false){
		document.getElementById("Log_output").innerHTML = "<tr><th>#</th><th>Name</th><th>Finals</th><th>Session</th><th>Deaths</th></tr>";
		Member_stats_sortiert = Object.fromEntries(Object.entries(Member_stats).sort((a, b) => {
			let finalsDiff = b[1].finals - a[1].finals;
		
			if (finalsDiff !== 0){
				return finalsDiff;
			}
	
			return b[1].session_finals - a[1].session_finals;
		}));
				//console.log(Member_stats_sortiert);
		for (let [Name, stats] of Object.entries(Member_stats_sortiert)) {
				//console.log(Name);
				//console.log(Party);
			if (Party.includes(Name)){
				if (Member_stats_sortiert[Name].finals > 3){
					final_color = "red";
				}
				else if(Member_stats_sortiert[Name].finals == 3){
					final_color = "orange";
				}
				else if(Member_stats_sortiert[Name].finals < 3){
					final_color = "lightgreen";
				}
				n ++;
				document.getElementById("tabelle").innerHTML += "<tr><td>" + n + "</td><td>" + Name + "</td><td style=color:" + final_color +">" + Member_stats_sortiert[Name].finals + "</td><td>" + Member_stats_sortiert[Name].session_finals + "</td><td>" + Member_stats_sortiert[Name].final_deaths + "</td></tr>"
			}
		}
		if (finals_lost < 1){
			lost_color = "lightgreen";
		}
		else if (finals_lost < 3){
			lost_color = "orange"; 
		}
		else if (finals_lost > 2){
			lost_color = "red";
		}
		
		if(pause == false){
			if (!isNaN(finals_lost)){
				document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "Finals Lost: <span style=color:" + lost_color +">" + finals_lost + "</span>";
			}
			else {
				document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "Finals Lost: <span style=color:lightgreen>0</span>";
			}
		}
		else {
			document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "<span style=color:red> Currently paused </span>";
		}
	}
	else if (beds == true){
		document.getElementById("Log_output").innerHTML = "<tr><th>#</th><th>Name</th><th>&zwnj; Beds &zwnj;</th><th>Session</th><th>Deaths</th></tr>";
		Member_stats_sortiert = Object.fromEntries(Object.entries(Member_stats).sort((a, b) => {
			let bettenDiff = b[1].beds - a[1].beds;
	
			if (bettenDiff !== 0){
				return bettenDiff;
			}

			return b[1].session_beds - a[1].session_beds;
		}));
				//console.log(Member_stats_sortiert);
		for (let [Name, stats] of Object.entries(Member_stats_sortiert)) {
				//console.log(Name);
				//console.log(Party);
			if (Party.includes(Name)){
				if (Member_stats_sortiert[Name].beds > 2){
					bed_color = "red";
				}
				else if(Member_stats_sortiert[Name].beds == 2){
					bed_color = "orange";
				}
				else if(Member_stats_sortiert[Name].beds < 2){
					bed_color = "lightgreen";
				}
				n ++;
				document.getElementById("tabelle").innerHTML += "<tr><td>" + n + "</td><td>" + Name + "</td><td style=color:" + bed_color + ">" + Member_stats_sortiert[Name].beds + "</td><td>" + Member_stats_sortiert[Name].session_beds + "</td><td>" + Member_stats_sortiert[Name].final_deaths + "</td></tr>"
			}
		}
		if (finals_lost < 1){
			lost_color = "lightgreen";
		}
		else if (finals_lost < 3){
			lost_color = "orange"; 
		}
		else if (finals_lost > 2){
			lost_color = "red";
		}
		
		if(pause == false){
			if (!isNaN(finals_lost)){
				document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "Finals Lost: <span style=color:" + lost_color +">" + finals_lost + "</span>";
			}
			else {
				document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "Finals Lost: <span style=color:lightgreen>0</span>";
			}
		}
		else {
			document.getElementById("Finals_die_wir_verloren_haben_sadface").innerHTML = "<span style=color:red> Currently paused </span>";
		}
	}
		//console.timeEnd("DOM Update");
}

function switchen(){
	if (beds == false){
		document.getElementById("Switch_button").innerHTML = "Switch to Finals";
		beds = true;
		Update_DOM(Member_stats, Party, finals_lost, beds);
		return;
	}
	if (beds == true){
		document.getElementById("Switch_button").innerHTML = "Switch to Beds";
		beds = false;
		Update_DOM(Member_stats, Party, finals_lost, beds);
		return;
	}
}


