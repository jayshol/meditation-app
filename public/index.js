
const serverBase = '//localhost:8080/';
//const serverBase = 'https://shrouded-peak-49521.herokuapp.com/';
const Users_Url = serverBase + 'api/users';
const Audio_Url = serverBase + 'api/materials/audios';
const Badge_Url = serverBase + 'api/materials/badges';
const Challenge_Url = serverBase + 'api/challenges';
const SignUp_Url = serverBase + "api/users/signup";
const Login_Url = serverBase + "api/auth/login";
const Delete_Url = serverBase + "api/users/remove";
let localUserObject = null;
let caller = '';
const audio = $('#player')[0];

// initializing the application
function handleNavigationClicks(){
	$('.js-displaySignup').click(displaySignUp);
	$('.js-displayLogin').click(displayLogin);
	$(".js-logoutBtn").click(logoutUser);
	$('.signUpForm').submit(handleSignUp);
	$('.loginForm').submit(loginUser);
	$('#dashboardBtn').click(displayDashboard);
	$('#challengeBtn').click(challengeReport);
	$('#meditate-btn').click(meditationPage);
	$('#delete-btn').click(handleDelete);
	$('.audio-container').on("click", ".js-text", displayMeditationWindow);
	$('.js-nextChallenge').click(handleChallengeSignUp);
	$('#signUp').click(displaySignUp);
	$('#loginBtn').click(displayLogin);
	$('#homeBtn').click(function(){
		togglePageManager('.container-home');
	});	
	
	$(window).click(handleWindowClick);

	$('.dropbtn').click(handleDropdown);

	//handling navbar sliding
	$(".navbarHolder").click(toggleNavbar);	
	$("#playerHolder").click(togglePlayer);
	
	//handling events of audio player
	$('.playBtnClass').click(playAudio);
	$('.js-pause').click(pauseAudio);
	$('.js-stop').click(stopAudio);
	$('.js-close').click(closeAlert);
	$('.js-confirm-close').click(closeConfirm);

	//handling events of alert box
	$('#ok').click(handleOk);
	$('#cancel').click(handleCancel);
	$('#okBtn').click(closeAlert);
	
	closeAlert();
	manageNavBeforeLogin();
	togglePageManager('.container-home');
}

//manage navigation bar
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

//handle audio controls
function playAudio(){	
	audio.play();
}

//handle audio controls
function pauseAudio(){	
	if(!audio.paused){
		audio.pause();
	}	
}

//handle audio controls
function stopAudio(){
	if(!audio.paused){
		caller = "audioStop";
		showConfirm("Are you sure you want to end this session?");
	}	
}

//handle audio controls
function stopPlayer(){	
	audio.pause();
	audio.currentTime = 0;
	meditationPage();
}

function handleDropdown() {
    $("#drop-down").toggleClass("show");
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

// Close the dropdown if the user clicks outside of it
function handleWindowClick(e){	
  if (!e.target.matches('.dropbtn')) {	
      $('#drop-down').removeClass("show");
  }	   	
}

//handles the Ok, Cancel button of the confirm box
function handleOk(){	
	switch(caller){
		case 'delete': 	deleteUser();
					   	break;
		case 'signUp': 	getUserObject(signUpUser);
						break;
		case 'audioStop' : 	stopPlayer();
							break;
		default : break;
	}
	$('.confirmClass').hide();
}

function handleCancel(){
	$('.confirmClass').hide();
}

//displays the confirm box for deleting the user
function handleDelete(){
	caller = "delete";
	showConfirm("Are you sure you want to delete this account?");	
}

//close user account
function deleteUser(){
	const urlStr = Delete_Url + "/" + JSON.parse(sessionStorage.getItem("userId"));	
	$.ajax({
		url: Delete_Url + "/" + JSON.parse(sessionStorage.getItem("userId")),
		method: "DELETE",
		contentType: "application/json",
		dataType: 'json',
		success: userDeleted,
		error: function(err){
			console.log(err);
			showAlert("Unable to delete user. Please try again.");
		},
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});	
}

//handle the app after closing account
function userDeleted(){	
	sessionStorage.removeItem('tokenKey');
	sessionStorage.removeItem('userId');	
	togglePageManager('.container-home');
	manageNavBeforeLogin();
	showAlert("User deleted.");
}

// toggling the audio player display
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

function displaySignUp(){
	togglePageManager('.signup-window');
	$('.signUpForm :input:enabled:visible:first').focus();
}

function displayLogin(){
	togglePageManager('.login-window');
	$('.loginForm :input:enabled:visible:first').focus();
}

//loggin in user and generating jwt token
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

//signing up the user
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
			error: showError,
			contentType:'application/json'
		}); 
	}	
}

//Return form data in the form of an object
function getFormData(data){
	const indexed_array = {};

   $.map(data, function(n, i) {
	   	if(n['name'] !== "confirmPassword"){
	   		indexed_array[n['name']] = n['value'];
	   	}    
   });  
   return indexed_array;
}

//Store the token in session storage
function generateUserToken(data) {	
	sessionStorage.setItem("tokenKey", data.authToken);
	sessionStorage.setItem("userId", JSON.stringify(data.user._id));
	$('.loginForm').find('input:text, input:password').val('');
	localUserObject = null;
	resetNextChallenge();
	manageNavAfterLogin();
	displayDashboard();
}

//Clear the session storage and manage navbar after logout
function logoutUser(){	
	sessionStorage.removeItem('tokenKey');
	sessionStorage.removeItem('userId');
	localUserObject = null;	
	togglePageManager('.container-home');
	manageNavBeforeLogin();
	showAlert("You are successfully logged out.");	
}

// success message after sign up.
function userSignedUp(data){
	showAlert("You are signed Up. Please log in.");
	$('.signUpForm').find('input:text, input:password').val('');
	displayLogin();
}

//sign up a user for 21-day challenge
function handleChallengeSignUp(){
	const month = monthNames[new Date().getMonth() + 1];
	const text = "You will be signed up for " + month + " month's 21-day challenge";
	caller = "signUp";
	showConfirm(text);	
}

//register user for the 21-day challenge and update both
//user as well as challenge objects
function signUpUser(user){		
	if(user !== null){
		user.isRegisteredForNextChallenge = true;
		const challengeName = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
		const regObject = {
			challengeName: challengeName,
			status: "Not started"
		}

		user.registeredChallenges.push(regObject);
		localUserObject = user;

		//update the user object with the new challenge sign up
		$.ajax({
			url: Users_Url +"/" + JSON.parse(sessionStorage.getItem("userId")) ,
			method: 'PUT',
			data: JSON.stringify(user),
			success: getChallengeObject,
			dataType: 'json',
			contentType: 'application/json',
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			}
		}); 
	}	
}

function getChallengeObject(){	
	const challengeName = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
	const url = Challenge_Url + "/" + challengeName;	
	$.ajax({
		url: url,
		method: "GET",
		dataType: 'json',
		contentType: 'application/json',
		success: updateChallenges,
		error: showError,
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});
}


//update challenge object with the registered user
function updateChallenges(challenge){	
	if(challenge === null){
		const name = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
		const usersArray = [];
		usersArray.push(localUserObject);

		const newObject = {
			name : name,
			registeredUsers : usersArray,
			startDate : formatDate((new Date().getMonth()+2) + "/1/" + new Date().getFullYear()),
			endDate : formatDate((new Date().getMonth()+2) + "/21/" + new Date().getFullYear()),
			status : "Not Started"
		}

		$.ajax({
			url: Challenge_Url,
			method: 'POST',
			data: JSON.stringify(newObject),
			success: signUpSuccess,
			dataType: 'json',
			contentType:'application/json',
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			}
		});
		
	} else{
		challenge.registeredUsers.push(localUserObject);				
		$.ajax({
			url :Challenge_Url + "/" + challenge._id,
			method: "PUT",
			data : JSON.stringify(challenge),
			success : signUpSuccess,
			dataType : 'json',
			contentType: 'application/json',
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			},
			error: function(err){
				console.log(err);
			}
		}); 
	}	
}

function signUpSuccess(){
	showAlert("You are signed up.");	
	updateNextChallenge();
}

//fetches meditation audio files
function meditationPage(){
	togglePageManager('.container-meditate');

	$.ajax({
		url: Audio_Url,
		method: 'GET',
		success: populateAudioFiles,		
		contentType: 'application/json',
		dataType: 'json',
		error: showError,
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}		
	});	 							
}

//displays meditation audio files
function populateAudioFiles(audios){
	$(".audio-container").html('');
	for(let i=0;i<audios.length;i++){
		let htmlString = `<div class="image-container">							
							<img src='${audios[i].imageUrl}' 
								alt="meditation audio" 
								class="meditation-audio" />
							<span class="js-text">
							 <p data-audio='${JSON.stringify(audios[i])}'>${audios[i].name.split(' ')[0]}</p>
							</span>														
						  </div>`;		
		$('.audio-container').append(htmlString);
	}	
}

function displayMeditationWindow(event){
	togglePageManager('.meditation-window');	
	const dataObj = $(event.target).data("audio");	
	const audio = $('#player');
	$('#audio-src').attr("src", dataObj.url);
	audio[0].pause();
	audio[0].load();
	$('progress').value = 0;	
	$(audio[0]).on("timeupdate", updateProgress);
	$(audio[0]).on("ended", meditationComplete);
}

// update the progress bar as the audio plays
function updateProgress(){	
	const audio = $('#player')[0];	
	$('progress').attr("value", Math.floor(audio.currentTime / audio.duration * 100));
}

function meditationComplete(){
	$(this).currentTime = 0;	
	if(localUserObject === null){
		getUserObject(updateUserData);
	}else{
		updateUserData(localUserObject);						
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
			showAlert("Session Completed.");
			meditationPage();
		},
		error: showError,
		beforeSend:function(xhr){
			xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
		}
	});
}

function updateUserData(user){	
	if(user !== null){		
		const todaysDate = new Date();
		//user has already meditated today(no need to record)
		if(user.lastMeditated !== formatDate(todaysDate)){
			if(user.lastMeditated === undefined){			
				user = firstTimeUser(user);				
			} else{
				user.numberOfDaysMeditated += 1;
				if(checkStreak(user.lastMeditated)){
					//increment steak
					user.streak += 1;
					if(user.registeredForCurrentChallenge && user.active){
						user.active = true;
					}else{
						user.active = false;
					}
					checkAndUpdateBadges(user);
				}else{
					//user meditating after a gap
					user.streak = 1;
					if(user.registeredForCurrentChallenge){
						if(todaysDate.getDate() === 1){
							user.active = true;
						}else{
							user.active = false;
						}					
					}
				}
				user.lastMeditated = formatDate(todaysDate);
				if(todaysDate.getDate() >= 1 && todaysDate.getDate() <= 21 && user.active){
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
		showAlert("Please login before you meditate");
		togglePageManager('login-window');
	}	
}

function firstTimeUser(user){
	user.lastMeditated = formatDate(todaysDate);
	user.streak = 1;
	user.numberOfDaysMeditated = 1;
	if(user.registeredForNextChallenge && todaysDate.getDate() === 1){
		user.active = true;
		updateChallengeInfo("lastMeditated", formatDate(todaysDate), user);
	}
	return user; 
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
		const url = Badge_Url + "/" + name;		

		$.ajax({
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			},
			url:url,
			dataType: 'json',
			method: 'GET',
			success: function(badge){
				if(badge !== null){
					user.badges.push(badge);
				}
			},
			error: showError
		});
	}			
}

function showError(err){
	const error = JSON.parse(err.responseText);
	showAlert(error.location + " " + error.message);
}

//checks if the user is continually meditating
function checkStreak(lastMeditated){		
	const date1 = Date.parse(lastMeditated);
	const date2 = Date.parse(formatDate(new Date()));
	const diff = parseInt(date2 - date1);	
	if(diff === 86400000){
		return true;
	}else{
		return false;
	}	
}

//format the date pattern to store in the database
function formatDate(dateString){	
	const dateObject = (dateString !== undefined) ? new Date(dateString) : new Date();		 
	const month = (dateObject.getMonth()+1) < 10 ? "0" + (dateObject.getMonth()+1) : dateObject.getMonth()+1;
	const date = (dateObject.getDate() < 10) ? "0" + dateObject.getDate() : dateObject.getDate();		
	const formattedDate = month +"/" + date + "/" + dateObject.getFullYear();	
	return formattedDate;
}

//Retrieve the user object from the database and invoke the passed callBack function with it.
//If it is already available just invoke the callBack with it.
function getUserObject(callBack){	
	if(localUserObject !== null){
		callBack(localUserObject);
	}else{
		const url = Users_Url + "/" + JSON.parse(sessionStorage.getItem("userId"));			
		$.ajax({
			url:url,
			dataType:'json',
			method: 'GET',
			success: callBack,
			contentType: 'application/json',
			error: showError,
			beforeSend:function(xhr){
				xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("tokenKey"));
			}
		});
	}	
}

//Fetch the data of the 21-day challenge from database
function challengeReport(){
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
		error:showError
	});
}

//display the 21-day challenge
function handleData(challenge){	
	if(challenge !== null){	
		sortChallengeData(challenge);
		displayUsers(challenge);
		displayChallengeData(challenge);
	}else{
		showAlert("Challenge is not available");
	}
}

function displayChallengeData(challenge){
	if(isRegistered(getCurrentChallengeName())){
		$(".js-currentChallenge").show();
	}else{
		$(".js-currentChallenge").hide();
	}

	if(isRegistered(getNextChallengeName())){
		updateNextChallenge();
	}
	$(".month-span").text(fullMonthNames[new Date().getMonth()]);
	$(".user-span").text(challenge.registeredUsers.length);
	const hbars = $('.hbar');
	for(let i=0;i<challenge.registeredUsers.length;i++){
		const user = challenge.registeredUsers[i];
		const elements = $(hbars[i+1]).find('.dayBarClass');		
		//if the user has meditated then display
		if(getLastMeditatedDate(user) !== undefined){
			const lastMeditatedDate = new Date(user.lastMeditated);
			const days_meditated = getLastMeditatedDate(user);
			const month = getLastMeditatedMonth(user);
			const year = getLastMeditatedYear(user);					
			if(new Date().getFullYear() === year){
				for(let j=0;j<days_meditated;j++){								
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

//Sorts the users in descending order based on their days of meditation
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

//Retrieves the last meditated date with regard to the registered challenge
function getLastMeditatedDate(user){
	const challengeName = getCurrentChallengeName();
	for(let i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			if(user.registeredChallenges[i].lastMeditated === undefined){
				return undefined;
			}else{
				return new Date(user.registeredChallenges[i].lastMeditated).getDate();
			}			
		}
	}
}

//returns the full year of the date the user last meditated
function getLastMeditatedYear(user){
	const challengeName = getCurrentChallengeName();
	for(let i=0;i<user.registeredChallenges.length;i++){
		if(user.registeredChallenges[i].challengeName === challengeName){
			if(user.registeredChallenges[i].lastMeditated === undefined){
				return undefined;
			}else{
				return new Date(user.registeredChallenges[i].lastMeditated).getFullYear();
			}			
		}
	}
}

//returns the month of the last meditated date
function getLastMeditatedMonth(user){
	const challengeName = getCurrentChallengeName();
	for(let i=0;i<user.registeredChallenges.length;i++){
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
	return monthNames[new Date().getMonth()] + "-" + new Date().getFullYear();	
}

function getNextChallengeName(){
	return monthNames[new Date().getMonth()+1] + "-" + new Date().getFullYear();
}

//displays the users who have registered for the challenge
function displayUsers(challenge){	
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
	$('.usersList').html(htmlString);
}

//creates the header for displaying the challenge data
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
	togglePageManager('.container-dashboard');	
	getUserObject(populateDashboard);		
}

//handles the display of pages based on navigation
function togglePageManager(pageName){
	
	if(pageName !== '.meditation-window'){
		$('.navbarHolder').hide();
		$('#playerHolder').hide();
		$('.playerDiv').hide();
		$(document.body).addClass("regularBackground");
		$(document.body).removeClass("backgroundClass");
		$('#navbarDiv').removeClass("meditate-navbar");
		$('#drop-down').removeClass('meditate-dropdown-content');
	}else{
		$('.navbarHolder').show();
		$('#playerHolder').show();
		$('.playerDiv').show();
		$(document.body).addClass("backgroundClass");
		$(document.body).removeClass("regularBackground");		
		$('#navbarDiv').addClass("meditate-navbar");
		$('#drop-down').addClass('meditate-dropdown-content');
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
	if(localUserObject === null){
		localUserObject = user;
	}
	
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

	fillAchievements(user.registeredChallenges);		
}


function updateNextChallenge(){
	$(".js-nextChallenge").text("You are registered for " + getNextChallengeName() + " challenge.");		
	$('.js-nextChallenge').unbind("click");
	$(".js-nextChallenge").css("cursor", "default");
}

function resetNextChallenge(){
	$(".js-nextChallenge").text("Sign Up for the next month's challenge");
	$('.js-nextChallenge').click(handleChallengeSignUp);
	$('.js-nextChallenge').css("cursor","pointer");
}

function isRegistered(challengeName){
	for(let i=0;i<localUserObject.registeredChallenges.length;i++){
		if(localUserObject.registeredChallenges[i].challengeName === challengeName){			
			return true;
		}
	}
	return false;
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
const fullMonthNames =['January', 'February', 'March','April','May','June','July','August','September','October','November','December'];

$(function(){	
	handleNavigationClicks();
});