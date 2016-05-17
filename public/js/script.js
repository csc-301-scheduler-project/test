function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

// function intToRGB(i){
//     var c = (i & 0x00FFFFFF)
//         .toString(16)
//         .toUpperCase();

//     return "00000".substring(0, 6 - c.length) + c;
// }

function intToHSL(i) {
	var shortened = i % 360;
    return "hsl(" + shortened + ",50%,85%)";
}

function insertSection(section, course_code, classTimes) {
	var times = section.times;

	for (var j=0; j<times.length; j++) {
		var day = "." + times[j].day[0].toUpperCase() + times[j].day.substr(1).toLowerCase(),
			time = times[j].start,
			start = times[j].start,
			end = times[j].end,
			center = ((end - start  - 1) / 2) + start, // Subtracting 1 because it doesn't include the end hour
			even = ( (times[j].duration % 2) == 0);
			var isConflict = false;

		while (time != end) {
			var classTime = times[j].day.toUpperCase() + time;
			var hourRow = $("." + time);
			hourBlock = hourRow.children(day);
			if (classTimes.indexOf(classTime) > -1){
				isConflict = true;
			}
			else{
				classTimes.push(classTime);
			}
			if (isConflict){
				var colour = "#FF0000";
			}
			else{
				hourBlock[0].start = start;
				hourBlock[0].end = end;
				var colour = intToHSL(hashCode(course_code));
			}
			
			hourBlock.css("border", "none");
			hourBlock.css("background-color", colour);
			hourBlock.css("padding", "15px");
			time += 1;
		}

		if (even) {
			var firstHalf = Math.floor(center),
				secondHalf = Math.ceil(center),
				firstHalfBlock = $("." + firstHalf).children(day), // Doing same thing as hourBlock -> hourRow just all in 1 line
				secondHalfBlock = $("." + secondHalf).children(day);
				if (isConflict){
					var conflictStart = Math.min(start, firstHalfBlock[0].start);
					var conflictFirstHalf = "";
					for (var i = conflictStart; i < secondHalfBlock[0].end; i++){
						var tempBlock = $("." + i).children(day);
						conflictFirstHalf += tempBlock[0].innerHTML + "<br>";
						tempBlock.css("background-color", "#FF0000");
					}
					conflictFirstHalf = removeConflictStr(conflictFirstHalf);
					firstHalfBlock = $("." + conflictStart).children(day)
					if (conflictStart == start){
						firstHalfBlock.html("CONFLICT<br>" + course_code + "<br>" + section.code + "<br>" + times[j].location + "<br>" + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00" + "<br><br>");
						secondHalfBlock.html(conflictFirstHalf);
					}
					else{
						firstHalfBlock.html("CONFLICT<br>" + conflictFirstHalf);
						secondHalfBlock.html(course_code + "<br>" + section.code + "<br>" + times[j].location + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00" + "<br><br>");
					}
					
				}
				else{
					firstHalfBlock.html(course_code + "<br>" + section.code + "<br>" + times[j].location);
					secondHalfBlock.html(section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00");
				}
		} else {
			var centerBlock = $("." + center).children(day);
			if (isConflict){
				var oneHour = false;
				if (start == centerBlock[0].start && end == centerBlock[0].end && (end - start) == 1){
					oneHour = true;
				}
				var conflictStart = Math.min(start, centerBlock[0].start);
				var secondHalfBlock = $("." + (centerBlock[0].end - 1)).children(day);
				var conflictFirstHalf = "";
				for (var i = conflictStart; i < centerBlock[0].end; i++){
					var tempBlock = $("." + i).children(day);
					conflictFirstHalf += tempBlock[0].innerHTML + "<br>";
					tempBlock.css("background-color", "#FF0000");
				}
				conflictFirstHalf = removeConflictStr(conflictFirstHalf);
				firstHalfBlock = $("." + conflictStart).children(day)
				if (oneHour){
					firstHalfBlock.html("CONFLICT<br>" + course_code + "<br>" + section.code + "<br>" + times[j].location + "<br>" + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00" + "<br><br>" + conflictFirstHalf);
				}
				else if (conflictStart == start){
					firstHalfBlock.html("CONFLICT<br>" + course_code + "<br>" + section.code + "<br>" + times[j].location + "<br>" + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00");
					centerBlock.html(conflictFirstHalf);
				}
				else{
					firstHalfBlock.html("CONFLICT<br>" + conflictFirstHalf);
					secondHalfBlock.html(course_code + "<br>" + section.code + "<br>" + times[j].location + "<br>" + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00");
				}
			} else{
				centerBlock.html(course_code + "<br>" + section.code + "<br>" + times[j].location + "<br>" + section.instructors + "<br>" + getTime(start) + ":00 - " + getTime(end) + ":00");		
			}
		}
	}
}

function getTime(time){
	var retTime = time % 12;
	if (retTime == 0){
		retTime = 12;
	}
	return retTime;
}

function removeConflictStr(conflictStr){
	var conflictString = "CONFLICT<br>";
	if (conflictStr.indexOf(conflictString) > -1){
		conflictStr = conflictStr.substring(12);
	}
	return conflictStr;
}

var FALL_TERM = [];
var WINTER_TERM = [];

//generate without tutorials
function renderTimetable(json, index){
	var i = index - 1 || 0;
	var courses = json[i];
	var numPermutations = json.length;
	$('#total').html(numPermutations);
	$('#index').html(index);

	splitTerms(courses);
	if ($('#winterToggle').hasClass('active')) {
		renderTerm(WINTER_TERM);
	} else {
		renderTerm(FALL_TERM);
	}

}

//generate with tutorials
function renderTimetable2(json, index){
	var i = index - 1 || 0;
	var courses = json[i];
	var numPermutations = json.length;
	$('#total').html(numPermutations);
	$('#index').html(index);
	
	splitTerms(courses);
	if (!fallView) {
		console.log("WINTER TERM");
		renderTerm(WINTER_TERM);
	} else {
		console.log("FALL TERM");
		renderTerm(FALL_TERM);
	}

}

function splitTerms(courses) {
	FALL_TERM = [];
	WINTER_TERM = [];
	for (var i=0; i<courses.length; i++) {
		var course_code = courses[i].course_code;
		// console.log(course_code);
		var semester = course_code.charAt(course_code.length - 1);
		// console.log(semester);
		if (semester == 'F') {
			FALL_TERM.push(courses[i]);
		}
		else if (semester == 'S') {
			WINTER_TERM.push(courses[i]);
		}
		else {
			FALL_TERM.push(courses[i]);
			WINTER_TERM.push(courses[i]);
		}
	}
}

function renderTerm(term) {
	clearTimeTable();
	var classTimes = []
	for (var i=0; i<term.length; i++) {
		var section = term[i].meeting_section;
		var course_code = term[i].course_code;
		insertSection(section, course_code, classTimes);
	}
}

// SNIPPET FROM https://css-tricks.com/snippets/javascript/remove-inline-styles/
function remove_style(all) {
  var i = all.length;
  var j, is_hidden;

  // Presentational attributes.
  var attr = [
    'align',
    'background',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'color',
    'face',
    'height',
    'hspace',
    'marginheight',
    'marginwidth',
    'noshade',
    'nowrap',
    'valign',
    'vspace',
    'width',
    'vlink',
    'alink',
    'text',
    'link',
    'frame',
    'frameborder',
    'clear',
    'scrolling',
    'style'
  ];

  var attr_len = attr.length;

  while (i--) {
    is_hidden = (all[i].style.display === 'none');

    j = attr_len;

    while (j--) {
      all[i].removeAttribute(attr[j]);
    }

    // Re-hide display:none elements,
    // so they can be toggled via JS.
    if (is_hidden) {
      all[i].style.display = 'none';
      is_hidden = false;
    }
  }
}

function clearTimeTable() {
	blocks = $('#Schedule').find('td');
	remove_style(blocks);
	blocks.each(function(index, element) {
		blocks.eq(index).html('');
	});
}

function getCourseCodesQuery() {
	query = '';
	var msg = '';
	$('.courses').each(function(index, element) {
		value = $('.courses').eq(index).val();
		if (value != '') { // Check if input field actually has a course selected
			// Check that course code is valid
			
			if (value.length == 9) {

				console.log($(this));
				console.log(value.substring(value.length-1));
				console.log($(this).parent().attr('id'));
				if ($(this).parent().attr('id') == 'fallTerm' && value.toUpperCase().substring(value.length-1) == 'S') {
					msg += value.toUpperCase() + " is in the wrong term!<br>";
					$('#statusBar').html(msg);
					return true;
				}

				if ($(this).parent().attr('id') == 'winterTerm' && value.toUpperCase().substring(value.length-1) == 'F') {
					msg += value.toUpperCase() + " is in the wrong term!<br>";
					$('#statusBar').html(msg);
					return true;
				}

				if ($(this).parent().attr('id') == 'winterTerm' && value.toUpperCase().substring(value.length-1) == 'Y') {
					if ( !$(this).attr('disabled') ) {
						msg += value.toUpperCase() + " can't just be in Winter term, please remove it and put " + value.toUpperCase()
							+ " in Fall term.<br>";
							$('#statusBar').html(msg);
						}
					return true;
				}

				$.ajax({
					async: true,
					url: '/uoft/filter/code:'+ value,
					dataType: 'json',
					success: function(data) {
						if (data[0] == null) {
							msg += value.toUpperCase() + " is not a valid course code!<br>";
							$('#statusBar').html(msg);
						}
					},
					error: function(jqXHR, textError) {
						console.log(textError);
						console.log(jqXHR);
					}
				});
				query += value + ",";

			} else {
				msg += value.toUpperCase() + " is not a valid course code!<br>";
				$('#statusBar').html(msg);
			}
		} else {
			// If handling needed for no input
			// Possible counter/incrementation to check if ANY courses were selected at all
		}
	});

	return query.substring(0, query.length-1);
}

var fallData;
var winterData;
var fallCount = 1;
var winterCount = 1;
var fallView = true;
var tutorials;
$(document).ready(function() {

	$('.courses').on('blur', function() {
		console.log($(this).index());
		var value = $(this).val();
		var index = $(this).index();
		if ($(this).parent().attr('id') == 'fallTerm' // In Fall Term column
			&& value.length == 9 // Course code of length 9
			&& value.toUpperCase().substring(value.length-1) == 'Y') { // Course code ending in Y
			var correspondingInput = $('#winterTerm .courses').eq(index);
			correspondingInput.val(value);
			correspondingInput.attr('disabled', true);
			correspondingInput.after('<div class="x x-' + index + '" data-remove-class="x-' + index + '" data-remove-index="' + index + '">x</div>');
			$(this).after('<div class="x x-' + index + '" data-remove-class="x-' + index + '" data-remove-index="' + index + '">x</div>');
		}
	});

	$('body').on('click', '.x', function() {
		console.log($(this).attr('data-remove-index'));
		var index = $(this).attr('data-remove-index')
		var removeClass = '.' + $(this).attr('data-remove-class');
		var fTerm = $('#fallTerm .courses').eq(index);
		var wTerm = $('#winterTerm .courses').eq(index);
		fTerm.val('');
		wTerm.val('');
		wTerm.attr('disabled', false);
		//$(this).remove();
		$(removeClass).remove();
	});

	//generate without tutorials
	var courseCodes, json = [];

	$('#generateSchedule').on('click', function() {
		//reset status bar
		tutorials = false;
		$('#statusBar').html("");

		query = getCourseCodesQuery();
    	var filter = $('#filter').val();

		$.ajax({
			url: '/uoft/course/generate?courses=' + query + '&filter=' + filter,
			dataType: 'json',
			success: function(data) {
				DATA = data;
				console.log(DATA.length);
				renderTimetable(data, 1);
			},
			error: function(jqXHR, textError) {
				console.log(textError);
				console.log(jqXHR);
			}
		});
	});

	// if (!tutorials){
	// 	$('#prevPermutation').on('click', function() {
	// 	var index = parseInt($('#index').html());
	// 	if (index > 1) {
	// 		var newIndex = index - 1;
	// 		$('#index').html(newIndex);
	// 		renderTimetable(DATA, newIndex)
	// 	}
	// 	});

	// 	$('#nextPermutation').on('click', function() {
	// 		var index = parseInt($('#index').html());
	// 		var total = parseInt($('#total').html());
	// 		if (index < total) {
	// 			var newIndex = index + 1;
	// 			$('#index').html(newIndex);
	// 			renderTimetable(DATA, newIndex);
	// 		}
	// 	});

	// 	$('#fallToggle').on('click', function() {
	// 		renderTerm(FALL_TERM);
	// 	});

	// 	$('#winterToggle').on('click', function() {
	// 		renderTerm(WINTER_TERM);
	// 	});
	// }


	//generate with tutorials
	$('#generateSchedule2').on('click', function() {
		tutorials = true;
		fallCount = 1;
		winterCount = 1;
		//reset status bar
		$('#statusBar').html("");

		query = getCourseCodesQuery();
		fallTerm = '';
		winterTerm = ''; 
		courses = query.split(',');
		console.log(courses);
		for (var i = 0; i < courses.length; i++){
			if (courses[i].charAt(courses[i].length-1).toUpperCase() == 'F'){
				fallTerm += courses[i] + ",";
			}
			else if (courses[i].charAt(courses[i].length-1).toUpperCase() == 'S'){
				winterTerm += courses[i] + ",";
			}
			else{
				fallTerm += courses[i] + ",";
				winterTerm += courses[i] + ",";
			}
		}

		console.log(fallTerm);
    	var filter = $('#filter').val();

		$.ajax({
			url: '/uoft/course/generate2?courses=' + fallTerm + '&filter=' + filter,
			dataType: 'json',
			success: function(data) {
				fallData = data;
				console.log(fallData.length);
				if (fallView){
					renderTimetable2(fallData, 1);
				}
			},
			error: function(jqXHR, textError) {
				console.log(textError);
				console.log(jqXHR);
			}
		});

		$.ajax({
			url: '/uoft/course/generate2?courses=' + winterTerm + '&filter=' + filter,
			dataType: 'json',
			success: function(data) {
				winterData = data;
				console.log(winterData.length);
				if (!fallView){
					renderTimetable2(winterData, 1);
				}
			},
			error: function(jqXHR, textError) {
				console.log(textError);
				console.log(jqXHR);
			}
		});

	});

	
	$('#prevPermutation').on('click', function() {
		if (tutorials){
			if (fallView){
				if (fallCount > 1) {
					fallCount = fallCount - 1;
					$('#index').html(fallCount);
					renderTimetable2(fallData, fallCount);
				}
			}
			else{
				if (winterCount > 1){
					winterCount = winterCount - 1;
					$('#index').html(winterCount);
					renderTimetable2(winterData, winterCount);
				}
			}
		}
		else{
			var index = parseInt($('#index').html());
			if (index > 1) {
				var newIndex = index - 1;
				$('#index').html(newIndex);
				renderTimetable(DATA, newIndex)
			}
		}
	});

	$('#nextPermutation').on('click', function() {
		if (tutorials){
			var total = parseInt($('#total').html());
			if (fallView){
				if (fallCount < total) {
					fallCount = fallCount + 1;
					$('#index').html(fallCount);
					renderTimetable2(fallData, fallCount);
				}
			}
			else{
				if (winterCount < total){
					winterCount = winterCount + 1;
					$('#index').html(winterCount);
					renderTimetable2(winterData, winterCount);
				}
			}
		}
		else{
			var index = parseInt($('#index').html());
			var total = parseInt($('#total').html());
			if (index < total) {
				var newIndex = index + 1;
				$('#index').html(newIndex);
				renderTimetable(DATA, newIndex);
			}
		}
	});

	$('#fallToggle').on('click', function() {
		if (tutorials){
			fallView = true;
			$('#index').html(fallCount);
			renderTimetable2(fallData, fallCount);
		}
		else{
			renderTerm(FALL_TERM);
		}
		
	});

	$('#winterToggle').on('click', function() {
		if (tutorials){
			fallView = false;
			$('#index').html(winterCount);
			renderTimetable2(winterData, winterCount);
		}
		else{
			renderTerm(WINTER_TERM);
		}
	});
	
});