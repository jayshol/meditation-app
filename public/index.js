
const userId = '5b45c97f772ea0e87c00dc3a';
const serverBase = '//localhost:8080/';
const Users_Url = serverBase + 'users';
const Audio_Url = serverBase + 'audios';
const Badge_Url = serverBase + 'badges';
const Challenge_Url = serverBase + 'challenges';
const SignUp_Url = serverBase + "api/users/signup";
const Login_Url = serverBase + "api/auth/login";
const user = null;

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
	/*$(".audio-container").on("mouseover",".image-container", function(event){
		//console.log("hi");
		$(this).animate({height: "150px", width:"150px", opacity: 0.25}, 200);
	});
	$(".audio-container").on("mouseout",".image-container", function(event){
		//console.log("hi");
		$(this).animate({height: "120px", width:"120px", opacity: 1}, 200);
	});*/
	togglePageManager('.container-home');
}

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
		},
		contentType: 'application/json'
	});
}

function handleSignUp(event){
	event.preventDefault();
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
	})
	
	//alert("in sign up");
}

function getFormData(data){
	const indexed_array = {};

   $.map(data, function(n, i) {
    indexed_array[n['name']] = n['value'];
   });
   console.dir(indexed_array);
   return indexed_array;
}

function generateUserToken(data) {
	sessionStorage.setItem("tokenKey", data.authToken);
	togglePageManager('.container-meditate');
}

function logoutUser(){
	alert("hello");
	sessionStorage.removeItem('tokenKey');
	togglePageManager('.container-home');
}

function userSignedUp(data){
	alert("user signed Up");
}

function handleChallengeSignUp(){
	const month = monthNames[new Date().getMonth() + 1];
	const text = "You will be signed up for " + month + " month's 21-day challenge.";
	if(confirm(text)){
		getUserObject(function(userObj){
			if(userObj !== null){
				userObj.isRegisteredForNextChallenge = true;
				user = userObj;
				console.dir(userObj);
				//$.put(Users_Url, user, getChallengeObject);
				//getChallengeObject();
				$.ajax({
					url: Users_Url +"/" + userId,
					method: 'PUT',
					data: JSON.stringify(userObj),
					success: function(data){
						getChallengeObject();
					},
					dataType: 'json',
					contentType: 'application/json'
				});
			}
		});		
	}
}

function getChallengeObject(){
	//user = user;
	//console.dir(user);
	const challengeName = monthNames[new Date().getMonth() + 1] + "-" + new Date().getFullYear();
	const url = Challenge_Url + "/" + challengeName;
	console.log(url);
	$.getJSON(url, updateChallenges);
}

function updateChallenges(challenge){
	let challengeObject;
	//console.dir(user);
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
			},
			dataType: 'json',
			contentType:'application/json'
		});
		
	} else{
		challenge.registeredUsers.push(user);
		//challengeObject = challenge;

		$.ajax({
			url :Challenge_Url + "/" + challenge.name,
			method: "PUT",
			data : JSON.stringify(challenge),
			success : function(data){
				alert("User signed up");
			},
			dataType : 'json',
			contentType: 'application/json'
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
	for(let i=0;i<audios.length;i++){
		let htmlString = `<div class="image-container">							
							<img src='${audios[i].imageUrl}' 
								alt="meditation audio" 
								 class="meditation-audio"
								data-audio='${JSON.stringify(audios[i])}' />
								<span class="js-text">${audios[i].name}</span>														
						  </div>`;		
		$('.audio-container').append(htmlString);
	}	
}

function displayMeditationWindow(event){
	togglePageManager('.meditation-window');
	const dataObj = $(event.target).data("audio");
	$('.meditation-window').find('h2').text(dataObj.name);
	const audio = $('#player');
	$('#audio-src').attr("src", dataObj.url);
	audio[0].pause();
	audio[0].load();
	//audio[0].oncanplaythrough = audio[0].play();
	$(audio[0]).on("ended", meditationComplete);
}

function meditationComplete(){
	$(this).currentTime = 0;
	console.log("ended");
	//updateUserData();
	getUserObject(updateUserData);
}

function updateUserData(user){
	console.dir(user);
	if(user !== null){
		user.numberOfDaysMeditated += 1;
		//checkStreak(user.lastMeditated);
		if(checkStreak(user.lastMeditated)){
			user.streak += 1;
			checkAndUpdateBadges(user);
		}else{
			if(user.registeredForCurrentChallenge){
				user.active = false;
			}
		}
		user.lastMeditated = formatDate(new Date());

	}	
}

function checkAndUpdateBadges(user){
	if(user.streak === 21 && user.active !== true){
		return;
	}else{
		const name = user.streak + '-day';
		let url = Badge_Url + "/" + name;
		$.getJSON(url, function(badge){
			user.badges.push(badge);
		});
	}			
}

function checkStreak(lastMeditated){
	console.log(new Date(lastMeditated));
	console.log(new Date());
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
	const url = Users_Url + "/" + userId;
	$.getJSON(url, function(user){
		callBack(user);
	}); 		
}

function challengeReport(){
	//$('.container-challenge').show();
	togglePageManager('.container-challenge');
	sortChallengeData();
	displayUsers();
	displayChallengeData();
}

function displayChallengeData(){
	
	const hbars = $('.hbar');
	for(let i=0;i<challengeData.registeredUsers.length;i++){
		const user = challengeData.registeredUsers[i];
		const days_meditated = new Date(user.lastMeditated).getDate();
		
		const elements = $(hbars[i+1]).find('.dayBarClass');
		//alert(challengeData.registeredUsers.length);
		for(let j=0;j<days_meditated;j++){
			if(user.active){
				$(elements[j]).css('background-color', "#FFD368");
			}else{
				$(elements[j]).css('background-color', "lightblue");
			}
			
		}

	}
}

function sortChallengeData(){
	function compare(a, b){
		const aDate = new Date(a.lastMeditated).getDate();
		const bDate = new Date(b.lastMeditated).getDate();
		if(aDate < bDate){
			return 1;
		}
		if(aDate > bDate){
			return -1;
		}
		return 0;

	}

	challengeData.registeredUsers.sort(compare);
}

function displayUsers(){
	//console.dir(challengeData.registeredUsers);
	let htmlString = "<div class='outerDiv'>";
	htmlString += createHeader();
	for(let i=0;i<challengeData.registeredUsers.length;i++){
		const user = challengeData.registeredUsers[i];
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
	const resourceURL = Users_Url + "/" + userId;
	$.getJSON(resourceURL, function(user){
		console.dir(user);
		populateDashboard(user);
	});
	
}

function togglePageManager(pageName){	
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

	for(let i=0;i<user.badges.length;i++){
		let htmlString = "<div class='badgeClass'><img src='" + user.badges[i].imageUrl + "' alt='badge image' /><span>" + user.badges[i].name + "</span></div>";
		$('.badgesDiv').append(htmlString);
	}

	$('.streakCls').first().find('span').text(user.streak);
	$('.streakCls').next().find('span').text(user.numberOfDaysMeditated);
	
	if(user.isRegisteredForCurrent === 'yes'){
		$('.challengeCls').first().show();
	}else{
		$('.challengeCls').first().hide();
	}

	const str = (user.isRegisteredForNext === 'yes')? 'You are signed up for Next month\'s 21 day challenge': 'Sign up for next month\'s 21 day challenge.';

	$('.js-challenge').text(str); 	

	//fillAchievements('.registered', user.registeredChallenges);
	//fillAchievements('.completed', user.completedChallenges);
	
}

function fillAchievements(className, array){
	for(let i=0;i<array.length;i++){
		const dateObj = new Date(array[i].endDate);
		const str = '<span class="dateClass">' + monthNames[dateObj.getMonth()] + ", " + dateObj.getFullYear() + '</span>&nbsp;&nbsp;';
		$(className).find('div').append(str);		
	}
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/*
const dashboardData = {
	userName: "xyz",
	badges:[{
		type: '3-day',
		imageUrl: '/images/3-day-badge.jpg',		
	},
	{
		type: '7-day',
		imageUrl: '/images/7-day-badge.jpg',		
	}],
	streak : 5,
	registeredChallenges:[{
		registeredUsers :[10, 14, 12,80],
		activeUsers:[14,12],
		startDate: '01-01-18',
		endDate: '01/21/2018'    
	},
	{
		registeredUsers :[10, 14, 12,80],
		activeUsers:[14,12],
		startDate: '04-01-18',
		endDate: '04/21/2018'    
	}],
	completedChallenges:[{
		registeredUsers :[10, 14, 12, 80],
		activeUsers:[14,12],
		startDate: '01-01-17',
		endDate: '01-21-17'    
	},
	{
		registeredUsers :[10, 14, 12,80],
		activeUsers:[14,12],
		startDate: '01-01-18',
		endDate: '01/21/2018'    
	}],
	isRegisteredForCurrent: 'yes',
	isRegisteredForNext:'yes',
	numberOfDaysMeditated: 15
};
*/
const challengeData = {
	registeredUsers:[{
		userId: '111',
		userName: 'aaaaa',
		lastMeditated : '01-17-2018',
		active: true		
	},
	{
		userId: '222',
		userName: 'bbbb',
		lastMeditated : '01-13-2018',
		active:false		
	},
	{
		userId: '333',
		userName: 'ccccc',
		lastMeditated : '01-5-2018',
		active:false		
	},
	{
		userId: '444',
		userName: 'dddd',
		lastMeditated : '01-17-2018',
		active:true		
	},
	{
		userId: '555',
		userName: 'eeee',
		lastMeditated: '01-10-2018',
		active:false
	}
	],	
	startDate: '01-01-2018',
	endDate: '01-21-2018'
}; 
/*
const audioData = [{
	name: 'Relaxation Meditations',
	url:'/music/relaxationMeditation.mp3',
	imageUrl:'/images/meditation1.jpg'
}];
*/
/*
const badges = [{
	name: '3-day',
	imageUrl:'/images/3-day-badge.jpg'
},
{
	name: '7-day',
	image:'/images/7-day-badge.jpg'
},
{
	name: '14-day',
	image:'/images/14-day-badge.jpg'
},
{
	name: '30-day',
	image:'/images/30-day-badge.jpg'
},
{
	name: '21-day-badge',
	image:'/images/21-day-badge.jpg'
},
{
	name: '90-day',
	image:'/images/90-day-badge.jpg'
},
{
	name: '180-day',
	image:'/images/180-day-badge.jpg'
},
{
	name: 'gold',
	image:'/images/gold-badge.jpg'
}];
*/
/*
const usersObj = [{
	userId: '111',
  userName: 'aaa',
  password: 'xyz',
  facebookId:  'xyz',
  badges: [{
		name: '3-day',
		imageUrl: '/images/3-day-badge.jpg',		
	}],
  registeredForCurrentChallenge: true,
  lastMeditated:'07/09/2018',
  streak:  6,
  firstName:'aaa',
  lastName:'xyz',
  registeredChallenges:[],
  completedChallenges:[],
  isRegisterednextChallenge:false,  
  numberOfDaysMeditated: 17,
  active: true
},
{
	userId: '222',
  userName: 'bbb',
  password: 'abc',
  facebookId: 'abc' ,
  badges: [{
		name: '3-day',
		imageUrl: '/images/3-day-badge.jpg',		
	}],
  registeredForCurrentChallenge: false,
  lastMeditated:'06/08/2018',
  streak:  10,
  firstName:'bbb',
  lastName:'klm',
  registeredChallenges:[],
  completedChallenges:[],
  isRegisterednextChallenge:false,  
  numberOfDaysMeditated: 15,
  active:false
},
{
	userId: '333',
  userName: 'ccc',
  password:'xyz',
  facebookId: 'xyz', 
  badges: [{
		type: '3-day',
		imageUrl: '/images/3-day-badge.jpg',		
	}],
  registeredForCurrentChallenge: true,
  lastMeditated:'07/02/2018',
  streak:  7,
  firstName:'ccc',
  lastName:'mmm',
  registeredChallenges:[],
  completedChallenges:[],
  isRegisterednextChallenge:false,  
  numberOfDaysMeditated: 25,
  active:true
}];
*/

$(function(){
	//alert("hello");
	handleNavigationClicks();
});