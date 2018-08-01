
//const serverBase = '//localhost:8080/';
const serverBase = 'https://shrouded-peak-49521.herokuapp.com/';
const Users_Url = serverBase + 'users';
const Audio_Url = serverBase + 'audios';
const Badge_Url = serverBase + 'badges';
const Challenge_Url = serverBase + 'challenges';
const SignUp_Url = serverBase + "api/users/signup";
const Login_Url = serverBase + "api/auth/login";
let user = null;


function handleNavigationClicks(){
	$('.js-displaySignup').click(displaySignUp);
	$('.js-displayLogin').click(displayLogin);
	$(".js-logoutBtn").click(logoutUser);
	$('.signUpForm').submit(handleSignUp);
	$('.loginForm').submit(loginUser);
	$('#dashboardBtn').click(displayDashboard);
	$('#challengeBtn').click(challengeReport);
	$('#meditate-btn').click(meditationPage);
	$('.audio-container').on("click", ".js-text", displayMeditationWindow);
	$('.js-nextChallenge').click(handleChallengeSignUp);
	$('#signUp').click(displaySignUp);
	$('#loginBtn').click(displayLogin);
	$('#homeBtn').click(function(){
		togglePageManager('.container-home');
	});
	closeAlert();	
	togglePageManager('.container-home');
	$(window).click(function(e) {
	  if (!e.target.matches('.dropbtn')) {
	/*    var myDropdown = document.getElementById("myDropdown");
	      if (myDropdown.classList.contains('show')) {
	        myDropdown.classList.remove('show');
	      } */
	      $('#myDropdown').removeClass("show");
	  }

	   //$('.alertClass').hide();
	});

	$('.dropbtn').click(myFunction);

	$(".navbarHolder").click(toggleNavbar);
	//$(".navbarHolder").hide();
	$("#playerHolder").click(togglePlayer);
	//$("#playerHolder").hide();
	//$('.playerDiv').hide();

	$('.playBtnClass').click(playAudio);
	$('.js-pause').click(pauseAudio);
	$('.js-stop').click(stopAudio);
	$('.js-close').click(closeAlert);
	$('.js-confirm-close').click(closeConfirm);
	$('#ok').click(handleOk);
	$('#cancel').click(handleCancel);
	$('#okBtn').click(closeAlert);
	
	manageNavBeforeLogin();
}

function manageNavBeforeLogin(){
	$('.dropdown').hide();
	$('#challengeBtn').hide();
	$('.js-displaySignup').show();
	$('.js-displayLogin').show();
	$('#signUp').show();
	$('#loginBtn').show();	
}

function manageNavAfterLogin(){
	$('.dropdown').show();
	$('#challengeBtn').show();
	$('.js-displaySignup').hide();
	$('.js-displayLogin').hide();
	$('#signUp').hide();
	$('#loginBtn').hide();	
}

function playAudio(){
	$('#player')[0].play();
}

function pauseAudio(){
	$('#player')[0].pause();
}

function stopAudio(){
	if(confirm("Are you sure you want to stop this session?")){
		const audio = $('#player')[0];
		audio.pause();
		audio.currentTime = 0;
	}	
}

function myFunction() {
    $("#myDropdown").toggleClass("show");
}

function closeAlert(){
	$('.alertClass').hide();
}
function closeConfirm(){
	$('.confirmClass').hide();
}

function showAlert(message){
	$('.messageClass').text(message);
	$('.alertClass').show();
}

function showConfirm(message){
	$('.messageCls').text(message);
	$('.confirmClass').show();
}

function handleOk(){	
	signUpUser();
	$('.confirmClass').hide();
}

function handleCancel(){
	$('.confirmClass').hide();
}

function togglePlayer(){	
	$('.playerDiv').slideToggle("slow");
	if($("#playerHolder").css('bottom') == '0px'){
	  $("#playerHolder").animate({bottom:'200px'},505);	  
	}
	else
	{
	  $("#playerHolder").animate({bottom:'0px'},505);	  
	}  
}

function toggleNavbar(){
	$('.navbar').slideToggle('slow');
}

// Close the dropdown if the user clicks outside of it

function displaySignUp(){
	togglePageManager('.signup-window');
}

function displayLogin(){
	togglePageManager('.login-window');
}

function loginUser(event){
	event.preventDefault();
	
	const formData = getFormData($('.loginForm').serializeArray());
	$.ajax({
		url: Login_Url,
		method: "POST",
		dataType : 'json',
		data : JSON.stringify(formData),
		success: generateUserToken,
		error: function(err){
			console.dir(err);
			showAlert("Incorrect password or username.");
		},
		contentType: 'application/json'
	});
		
}

function handleSignUp(event){
	event.preventDefault();
	if($('#password').val() !== $('#confirmPassword').val()){
		showAlert("password and confirmPassword fields should match.");
	}else{
		const formData = getFormData($('.signUpForm').serializeArray());
		$.ajax({
			url: SignUp_Url,
			method: "POST",
			dataType:'json',
			data : JSON.stringify(formData),
			success : userSignedUp,
			error: function(err){
				const error = JSON.parse(err.responseText);
				alert(error.location + " " + error.message);
			},
			contentType:'application/json'
		}); 
	}	
}

function getFormData(data){
	const indexed_array = {};

   $.map(data, function(n, i) {
	   	if(n['name'] !== "confirmPassword"){
	   		indexed_array[n['name']] = n['value'];
	   	}    
   });
  // console.dir(indexed_array);
   return indexed_array;
}

function generateUserToken(data) {
	//cdisplayDashboard();onsole.dir(data);
	sessionStorage.setItem("tokenKey", data.authToken);
	sessionStorage.setItem("userId", JSON.stringify(data.user._id));
	//user = data.user;
	//meditationPage();
	manageNavAfterLogin();
	displayDashboard();
}

function logoutUser(){
	//alert("hello");
	sessionStorage.removeItem('tokenKey');
	sessionStorage.removeItem('userId');	
	togglePageManager('.container-home');
	manageNavBeforeLogin();
	showAlert("You are successfully logged out.");	
}

function userSignedUp(data){
	showAlert("You are signed Up. Please log in.");
	displayLogin();
}

function handleChallengeSignUp(){
	const month = monthNames[new Date().getMonth() + 1];
	const text = "You will be signed up for " + month + " month's 21-day challenge.";
	showConfirm(text);
	//if(confirm(text)){
		
	//} 
}

function signUpUser(){
	getUserObject(function(user){
		if(user !== null){
			user.isRegisteredForNextChallenge = true;
			const challengeName = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
			const regObject = {
				challengeName: challengeName,
				status: "Not started"
			}
	/*		if(! checkIfAlreadySignedUp(challengeName, user)){

			}else{
				alert("You have already signed up.")
			}*/
			user.registeredChallenges.push(regObject);
			//$.put(Users_Url, user, getChallengeObject);
			//getChallengeObject();
			console.dir(user);
			user = user;
			$.ajax({
				url: Users_Url +"/" + JSON.parse(sessionStorage.getItem("userId")) ,
				method: 'PUT',
				data: JSON.stringify(user),
				success: function(data){						
					getChallengeObject(user);
				},
				dataType: 'json',
				contentType: 'application/json',
				beforeSend:function(xhr){
					xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
				}
			}); 
		}
	});		
}

function getChallengeObject(user){
	user = user;
	//console.dir(user);
	const challengeName = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
	const url = Challenge_Url + "/" + challengeName;
	//console.log(url);
	//$.getJSON(url, updateChallenges);

	$.ajax({
		url: url,
		method: "GET",
		dataType: 'json',
		contentType: 'application/json',
		success: function(challenge){
			updateChallenges(challenge, user);
		},
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});
}

function updateChallenges(challenge, user){
	//let challengeObject;
	console.dir(user);
	if(challenge === null){
		const name = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
		const usersArray = [];
		usersArray.push(user);

		const newObject = {
			name : name,
			registeredUsers : usersArray,
			startDate : formatDate((new Date().getMonth()+2) + "/1/" + new Date().getFullYear()),
			endDate : formatDate((new Date().getMonth()+2) + "/21/" + new Date().getFullYear()),
			status : "Not Started"
		}
	//	challengeObject = newObject;
		console.dir(newObject);

		$.ajax({
			url: Challenge_Url,
			method: 'POST',
			data: JSON.stringify(newObject),
			success: function(){
				alert("You are signed up.");
				displayDashboard();
			},
			dataType: 'json',
			contentType:'application/json',
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			}
		});
		
	} else{
		challenge.registeredUsers.push(user);
		//challengeObject = challenge;
		console.dir(challenge);
		$.ajax({
			url :Challenge_Url + "/" + challenge._id,
			method: "PUT",
			data : JSON.stringify(challenge),
			success : function(data){
				alert("User signed up");
			},
			dataType : 'json',
			contentType: 'application/json',
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			},
			error: function(err){
				console.error(err);
			}
		}); 
	}	
}

function meditationPage(){
	togglePageManager('.container-meditate');

	$.ajax({
		url: Audio_Url,
		method: 'GET',
		success: populateAudioFiles,		
		contentType: 'application/json',
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}		
	});	 							
}

function populateAudioFiles(audios){
	$(".audio-container").html('');
	for(let i=0;i<audios.length;i++){
		let htmlString = `<div class="image-container">							
							<img src='${audios[i].imageUrl}' 
								alt="meditation audio" 
								class="meditation-audio" />
							<span class="js-text">
							 <p data-audio='${JSON.stringify(audios[i])}'>${audios[i].name}</p>
							</span>														
						  </div>`;		
		$('.audio-container').append(htmlString);
	}	
}

function displayMeditationWindow(event){
	togglePageManager('.meditation-window');
//	$('.navbarHolder').show();
//	$('#playerHolder').show();
//	$('.playerDiv').show();
	$('.meditation-window').addClass("backgroundClass");
	//console.log(event.target);
	const dataObj = $(event.target).data("audio");
	//$('.meditation-window').find('h2').text(dataObj.name);
	const audio = $('#player');
	$('#audio-src').attr("src", dataObj.url);
	audio[0].pause();
	audio[0].load();
	$('progress').value = 0;
	//audio[0].oncanplaythrough = audio[0].play();
	$(audio[0]).on("timeupdate", updateProgress);
	$(audio[0]).on("ended", meditationComplete);
}
function updateProgress(){	
	const audio = $('#player')[0];
	//console.log($('progress').attr("value"));
	$('progress').attr("value", Math.floor(audio.currentTime / audio.duration * 100));
}

function meditationComplete(){
	$(this).currentTime = 0;
	console.log("ended");
	console.log(user);
	if(user === null){
		getUserObject(updateUserData);
	}else{
		updateUserData();
		//getUserObject(updateUserData);
		console.dir(user);
		//saveUserObject();
	}
		
}

function saveUserObject(user){
	$.ajax({
		url: Users_Url + "/" + user._id,
		method: "PUT",
		dataType: 'json',
		contentType: 'application/json',
		data : JSON.stringify(user),
		success : function(){
			alert("User updated");
			meditationPage();

		},
		error: function(err){
			console.error(err);
			alert("Unable to update user.");
		},
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});
}

function updateUserData(user){	
	if(user !== null){		
		const todaysDate = new Date();
		if(user.lastMeditated !== formatDate(todaysDate)){
			if(user.lastMeditated === undefined){
				user.lastMeditated = formatDate(todaysDate);
				user.streak = 1;
				user.numberOfDaysMeditated = 1;
				if(user.registeredForNextChallenge && todaysDate.getDate() === 1){
					user.active = true;
					updateChallengeInfo("lastMeditated", formatDate(todaysDate), user);
				}
				
			} else{
				user.numberOfDaysMeditated += 1;
				if(checkStreak(user.lastMeditated)){
					user.streak += 1;
					if(user.registeredForCurrentChallenge && user.active){
						user.active = true;
					}else{
						user.active = false;
					}
					checkAndUpdateBadges(user);
				}else{
					user.streak = 1;
					if(user.registeredForCurrentChallenge){
						if(todaysDate.getDate === 1){
							user.active = true;
						}else{
							user.active = false;
						}					
					}
				}
				user.lastMeditated = formatDate(todaysDate);
				if(todaysDate.getDate() >= 1 && todaysDate.getDate() <= 21){
					updateChallengeInfo("lastMeditated", formatDate(todaysDate), user);
				}				
			}	
		}

		if(todaysDate.getDate() === 1){
			if(user.registeredForNextChallenge === true){
				user.registeredForCurrentChallenge = true;
				user.registeredForNextChallenge = false;
			}
		}
		if(todaysDate.getDate() === 21){
			if(user.registeredForCurrentChallenge && user.active === true){
				updateChallengeInfo("status","Completed", user);
			}
		}
		saveUserObject(user);
	}else{
		alert("Please login before you meditate");
		togglePageManager('login-window');
	}	
}

function updateChallengeInfo(field, value, user){
	const challengeName = getCurrentChallengeName();
	for(let i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			user.registeredChallenges[i][field] = value;			
		}
	}
}

function checkAndUpdateBadges(user){
	if(user.streak === 21 && user.active !== true){
		return;
	}else{
		const name = user.streak + '-day';
		let url = Badge_Url + "/" + name;
		$.getJSON(url, function(badge){
			if(badge !== null){
				user.badges.push(badge);
			}			
		});
	}			
}

function checkStreak(lastMeditated){
	//console.log(new Date(lastMeditated));
	//console.log(new Date());	
	const date1 = Date.parse(lastMeditated);
	const date2 = Date.parse(formatDate(new Date()));
	const diff = parseInt(date2 - date1);
	console.log(diff);
	if(diff === 86400000){
		return true;
	}else{
		return false;
	}	
}

function formatDate(dateString){
	
	const dateObject = (dateString !== undefined) ? new Date(dateString) : new Date();
		 console.dir(dateObject);
	const	month = (dateObject.getMonth()+1) < 10 ? "0" + (dateObject.getMonth()+1) : dateObject.getMonth()+1;
	const date = (dateObject.getDate() < 10) ? "0" + dateObject.getDate() : dateObject.getDate();
	//console.log(formattedDate);
	
	const formattedDate = month +"/" + date + "/" + dateObject.getFullYear();

	console.log(formattedDate);
	return formattedDate;
}


function getUserObject(callBack){
	const url = Users_Url + "/" + JSON.parse(sessionStorage.getItem("userId"));
	//console.log(url);
	$.ajax({
		url:url,
		dataType:'json',
		method: 'GET',
		success: function(user){
			user = user;
			callBack(user);			
		},
		contentType: 'application/json',
		error: function(err){
			console.error(err);
		},
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});

}


function challengeReport(){
	
	//$('.container-challenge').show();
	togglePageManager('.container-challenge');
	const challengeName = getCurrentChallengeName();
	const url = Challenge_Url + "/" + challengeName;
	$.ajax({
		url: url,
		method: "GET",
		dataType: 'json',
		contentType: 'application/json',
		success: handleData,
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		},
		error:function(err){
			console.err(err);
		}
	})

}

function handleData(challenge){
	//console.log(challenge);
	if(challenge !== null){	
		sortChallengeData(challenge);
		displayUsers(challenge);
		displayChallengeData(challenge);
	}else{
		alert("Challenge is not available");
	}
}

function displayChallengeData(challenge){
	
	const hbars = $('.hbar');
	for(let i=0;i<challenge.registeredUsers.length;i++){
		const user = challenge.registeredUsers[i];
		const elements = $(hbars[i+1]).find('.dayBarClass');
		
		if(getLastMeditatedDate(user) !== undefined){
			const lastMeditatedDate = new Date(user.lastMeditated);
			const days_meditated = getLastMeditatedDate(user);
			const month = getLastMeditatedMonth(user);
			const year = getLastMeditatedYear(user);
			//console.log(month + ' ' + new Date().getMonth());
			//console.log(year + ' ' + new Date().getFullYear());
			if(new Date().getMonth() === month && new Date().getFullYear() === year){
				for(let j=0;j<days_meditated;j++){
					//console.log(j);
					if(user.active){
						$(elements[j]).css('background-color', "#FFD368");
					}else{
						$(elements[j]).css('background-color', "lightblue");
					}				
				}
			}					
		}	
	} 
}

function sortChallengeData(challenge){
	function compare(a, b){
		
		const aDate = getLastMeditatedDate(a);		
		const bDate = getLastMeditatedDate(b);
		if(a.lastMeditated !== undefined && b.lastMeditated !== undefined){
			if(aDate < bDate){
				return 1;
			}
			if(aDate > bDate){
				return -1;
			}
			return 0;
		}else{
			if(a.lastMeditated === undefined && b.lastMeditated === undefined){
				return 0;
			}
			if(a.lastMeditated === undefined){
				return 1;
			}else if(b.lastMeditated === undefined){
				return -1;
			}
		}		
	}

	challenge.registeredUsers.sort(compare);
}

function getLastMeditatedDate(user){
	const challengeName = getCurrentChallengeName();
	for(const i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			if(user.registeredChallenges[i].lastMeditated === undefined){
				return undefined;
			}else{
				return new Date(user.registeredChallenges[i].lastMeditated).getDate();
			}			
		}
	}
}

function getLastMeditatedYear(user){
	const challengeName = getCurrentChallengeName();
	for(const i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			if(user.registeredChallenges[i].lastMeditated === undefined){
				return undefined;
			}else{
				return new Date(user.registeredChallenges[i].lastMeditated).getFullYear();
			}			
		}
	}
}

function getLastMeditatedMonth(user){
	const challengeName = getCurrentChallengeName();
	for(const i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			if(user.registeredChallenges[i].lastMeditated === undefined){
				return undefined;
			}else{
				return new Date(user.registeredChallenges[i].lastMeditated).getMonth();
			}			
		}
	}
}

function getCurrentChallengeName(){
	//return monthNames[new Date().getMonth()] + "-" + new Date().getFullYear();
	return "Jul-2018";
}

function displayUsers(challenge){
	//console.dir(challengeData.registeredUsers);
	let htmlString = "<div class='outerDiv'>";
	htmlString += createHeader();
	for(let i=0;i<challenge.registeredUsers.length;i++){
		const user = challenge.registeredUsers[i];
		htmlString += `<div class="barDiv"><div class='nameDiv'>${user.userName}</div><div class='hbar'>`;
		for(let i=0;i<21;i++){
			let dayBar = '<div class="dayBarClass"></div>';
			htmlString += dayBar;
		}
		htmlString += `</div></div>`;
	}

	htmlString += "</div>";
	$('.usersList').append(htmlString);
}

function createHeader(){
	let headerString = `<div class="barDiv"><div class='nameDivHeader'></div><div class='hbar'>`;
	for(let i=0;i<21;i++){
		let dayBar = `<div class='dayHeader'>${i+1}</div>`;
		headerString += dayBar;
	}
	headerString += `</div></div>`;
	return headerString;
}


function displayDashboard(){
	//alert("hi");
	togglePageManager('.container-dashboard');
	//const resourceURL = Users_Url + "/" + userId;
	if(user === null){
		getUserObject(populateDashboard);
		//console.dir(user);
	}else{
		populateDashboard(user);
	}
	/*$.getJSON(resourceURL, function(user){
		console.dir(user);
		populateDashboard(user);
	}); */

	//populateDashboard();
	
}

function togglePageManager(pageName){
	
	if(pageName !== '.meditation-window'){
		$('.navbarHolder').hide();
		$('#playerHolder').hide();
		$('.playerDiv').hide();
	}else{
		$('.navbarHolder').show();
		$('#playerHolder').show();
		$('.playerDiv').show();
	}

	const pageNames = ['.container-home', 
					   '.container-dashboard', 
					   '.container-challenge', 
					   '.container-meditate',
					   '.meditation-window',
					   '.signup-window',
					   '.login-window'
					   ];
	for(let i=0; i<pageNames.length; i++){
		if(pageNames[i] !== pageName) {			
			$(pageNames[i]).hide();
		}		
	}	

	$(pageName).show();

}

function populateDashboard(user){
	//console.dir(user);
	$('.badgesDiv').html('');
	for(let i=0;i<user.badges.length;i++){
		let htmlString = "<div class='badge-div'><div class='badgeClass'><img src='" + user.badges[i].imageUrl + "' alt='badge image' /></div><span>" + user.badges[i].name + "</span></div>";
		$('.badgesDiv').append(htmlString);
	}
	if(user.badges.length === 0){
		$('.badgesDiv').html('<p>No badges earned so far.</p>');
	}

	$('.streakCls').first().find('span').text(user.streak || 0);
	$('.streakCls').next().find('span').text(user.numberOfDaysMeditated || 0);
	
	if(user.isRegisteredForCurrent === 'yes'){
		$('.challengeCls').first().show();
	}else{
		$('.challengeCls').first().hide();
	}

	if(user.isRegisteredForNextChallenge){
		$('#signedUp').show();
		$('#notSigned').hide();
	} else{
		$('#signedUp').hide();
		$('#notSigned').show();
	}

	//$('.js-challenge').text(str); 	

	fillAchievements(user.registeredChallenges);
	//fillAchievements('.completed', user.completedChallenges);
	
}

function fillAchievements( array){
	$('.registered').find("div").html('');
	$('.completed').find("div").html('');
	for(let i=0;i<array.length;i++){
		const str = '<span class="dateClass">' + array[i].challengeName + '</span>&nbsp;&nbsp;';
		if(array[i].status === "completed"){
			$('.completed').find('div').append(str);
		}else{
			$('.registered').find('div').append(str);
		}				
	}
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


$(function(){	
	handleNavigationClicks();
});