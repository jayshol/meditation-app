
function handleNavigationClicks(){
	$('#dashboardBtn').click(displayDashboard);
	$('#challengeBtn').click(challengeReport);
	togglePageManager('.container-home');
}

function challengeReport(){
	//$('.container-challenge').show();
	togglePageManager('.container-challenge');
	displayUsers();
}

function displayUsers(){
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
	populateDashboard();
}

function togglePageManager(pageName){	
	const pageNames = ['.container-home', '.container-dashboard', '.container-challenge'];
	for(let i=0; i<pageNames.length; i++){
		if(pageNames[i] !== pageName) {			
			$(pageNames[i]).hide();
		}		
	}
	$(pageName).show();

}

function populateDashboard(){

	for(let i=0;i<dashboardData.badges.length;i++){
		let htmlString = "<div class='badgeClass'><img src='" + dashboardData.badges[i].imageUrl + "' alt='badge image' /><span>" + dashboardData.badges[i].type + "</span></div>";
		$('.badgesDiv').append(htmlString);
	}

	$('.streakCls').first().find('span').text(dashboardData.streak);
	$('.streakCls').next().find('span').text(dashboardData.numberOfDaysMeditated);
	
	if(dashboardData.isRegisteredForCurrent === 'yes'){
		$('.challengeCls').first().show();
	}else{
		$('.challengeCls').first().hide();
	}

	const str = (dashboardData.isRegisteredForNext === 'yes')? 'You are signed up for Next month\'s 21 day challenge': 'Sign up for next month\'s 21 day challenge.';

	$('.js-challenge').text(str); 	

	fillAchievements('.registered', dashboardData.registeredChallenges);
	fillAchievements('.completed', dashboardData.completedChallenges);
	
}

function fillAchievements(className, array){
	for(let i=0;i<array.length;i++){
		const dateObj = new Date(array[i].endDate);
		const str = '<span class="dateClass">' + monthNames[dateObj.getMonth()] + ", " + dateObj.getFullYear() + '</span>&nbsp;&nbsp;';
		$(className).find('div').append(str);		
	}
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

const challengeData = {
	registeredUsers:[{
		userId: '111',
		userName: 'aaaaa',
		lastMeditated : '01-17-2018'		
	},
	{
		userId: '222',
		userName: 'aaaaa',
		lastMeditated : '01-17-2018'		
	},
	{
		userId: '333',
		userName: 'aaaaa',
		lastMeditated : '01-17-2018'		
	},
	{
		userId: '444',
		userName: 'aaaaa',
		lastMeditated : '01-17-2018'		
	}
	],
	inActiveUsers:[{
		userId: '222',
		userName: 'bbbb',
		lastMeditated: '01-17-2017',		
		memberSince: '01-22-2017'		
	},
	{
		userId: '222',
		userName: 'bbbb',
		lastMeditated: '01-17-2017',		
		memberSince: '01-22-2017'		
	},
	{
		userId: '222',
		userName: 'bbbb',
		lastMeditated: '01-17-2017',		
		memberSince: '01-22-2017'		
	}],
	startDate: '07-01-2018',
	endDate: '07-21-2018'
}; 
/*
const meditateData = {
	audioFiles:{

	},
	favorites:{

	},
	userId: 666,
	timer:{
		5, 10, 15, 20, 30
	}
}

*/



$(function(){
	//alert("hello");
	handleNavigationClicks();
});