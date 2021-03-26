var momentdates = {};
(function(){
	momentdates.labels = {
		"today"				: "hoy",
		"yesterday"			: "ayer",
		"tomorrow"			: "mañana",
		"week"				: "esta semana",
		"month"				: "este mes",
		"pastWeek"			: "última semana",
		"pastFortnight"		: "última quincena",
		"pastMonth"			: "último mes",
		"pastQuarter"		: "último trimestre",
		"pastSemester"		: "último semestre",
		"pastYear"			: "último año",
		"nextWeek"			: "próxima semana",
		"nextFortnight"		: "próxima quincena",
		"nextMonth"			: "próximo mes",
		"nextQuarter"		: "próximo trimestre",
		"nextSemester"		: "próximo semestre",
		"nextYear"			: "próximo año"
	};


	// now
	momentdates.today = function () {
		var firstDay = lastDay = moment().toDate();
		return [firstDay, lastDay];
	}

	momentdates.week = function () {
		var firstDay = moment().startOf("isoWeek").toDate();
		var lastDay = moment().endOf("isoWeek").toDate();
		return [firstDay, lastDay];
	}

	momentdates.month = function () {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return [firstDay, lastDay];
	}

	// past
	momentdates.yesterday = function () {
		var firstDay = lastDay = moment().subtract(1, "day").toDate();
		return [firstDay, lastDay];
	}

	momentdates.pastWeek = function () {
		var firstDay = moment().subtract(1, "weeks").startOf("isoWeek").toDate();
		var lastDay = moment().subtract(1, "weeks").endOf("isoWeek").toDate();
		return [firstDay, lastDay];
	}

	momentdates.pastFortnight = function (){
		var firstDay = moment().subtract(2, "weeks").startOf("isoWeek").toDate();
		var lastDay = moment().subtract(1, "weeks").endOf("isoWeek").toDate();
		return [firstDay, lastDay];
	}

	momentdates.pastMonth = function (){
		var date = moment().subtract(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return [firstDay, lastDay];							
	}

	momentdates.pastQuarter = function (){
		var date = moment().subtract(3, "month").toDate();
		var dateend = moment().subtract(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(dateend.getFullYear(), dateend.getMonth() + 1, 0);
		return [firstDay, lastDay];						
	}

	momentdates.pastSemester = function (){
		var date = moment().subtract(6, "month").toDate();
		var dateend = moment().subtract(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(dateend.getFullYear(), dateend.getMonth() + 1, 0);
		return [firstDay, lastDay];						
	}

	momentdates.pastYear = function (){
		var date = moment().subtract(1, "year").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return [firstDay, lastDay];							
	}

	momentdates.lastMonth = function (){
		var firstDay = moment().subtract(30, "days");
		var lastDay = moment().toDate();
		return [firstDay, lastDay];	
	}

	// future
	momentdates.tomorrow = function () {
		var firstDay = lastDay = moment().add(1, "day").toDate();
		return [firstDay, lastDay];
	}

	momentdates.nextWeek = function () {
		var firstDay = moment().add(1, "weeks").startOf("isoWeek").toDate();
		var lastDay = moment().add(1, "weeks").endOf("isoWeek").toDate();
		return [firstDay, lastDay];
	}

	momentdates.nextFortnight = function (){
		var firstDay = moment().add(1, "weeks").startOf("isoWeek").toDate();
		var lastDay = moment().add(2, "weeks").endOf("isoWeek").toDate();
		return [firstDay, lastDay];
	}

	momentdates.nextMonth = function (){
		var date = moment().add(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return [firstDay, lastDay];							
	}

	momentdates.nextQuarter = function (){
		var date = moment().add(3, "month").toDate();
		var dateend = moment().subtract(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), dateend.getMonth() + 1, 0);
		return [firstDay, lastDay];						
	}

	momentdates.nextSemester = function (){
		var date = moment().add(6, "month").toDate();
		var dateend = moment().subtract(1, "month").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), dateend.getMonth() + 1, 0);
		return [firstDay, lastDay];						
	}

	momentdates.nextYear = function (){
		var date = moment().add(1, "year").toDate();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return [firstDay, lastDay];							
	}
}());
