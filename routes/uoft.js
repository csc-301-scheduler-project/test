var express = require('express');
var router = express.Router();
var url = require('url');

var path = require('path');
var Cobalt = require(path.join(__dirname, '../models/cobalt/cobalt'));
var Generate = require(path.join(__dirname, '../models/generate'));
var Time = require(path.join(__dirname, '../models/time'));
var Sort = require(path.join(__dirname, '../models/sort'));
var Conflict = require(path.join(__dirname, '../models/conflict'));


router.get('/course/list', function(req, res, next) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  cobalt.listCourses(function(courses) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(courses));
  });
});

// Get the course with courseName
// example: CSC148H1F20159.
router.get('/course/name/:courseName', function(req, res, next) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  cobalt.getCourse(req.params.courseName, function(c) {
    var str = JSON.stringify(c, null, 2);
    res.write(str);

    res.end();
  });
});

// Get course by courseCode
// example: CSC301H1F
router.get('/course/code/:courseCode', function(req, res) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  cobalt.findCourse(req.params.courseCode, function(c) {
    var str = JSON.stringify(c, null, 2);
    res.write(str);

    res.end();
  });
});


// Find courses in department
// example: CSC
router.get('/filter/:q', function(req, res) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  cobalt.filterCourses(req.params.q, function(a) {
    // for (var i = 0; i < a.length; i++) {
    //   // var str = JSON.stringify(a[i], null, 2);
    //   // res.write(str);
      res.write(JSON.stringify(a));
    // }

    res.end();
  });
});

//Filter courses
router.get('/search/:dept', function(req, res) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  cobalt.searchCourses(req.params.dept, function(a) {
    for (var i = 0; i < a.length; i++) {
      var str = JSON.stringify(a[i], null, 2);
      res.write(str);
    }

    res.end();
  });
});


router.get('/course/generate', function(req, res, next) {
  var cobalt = new Cobalt('Yu6lYuyoUmSjWVMShglIbQKbKPTZYwxk');

  // We expect as GET parameter a list of course code seperated by comma.
  var courses = req.query.courses.split(',');

  if (courses.length < 1) {
    res.end(JSON.stringify({}));
  }

  // We want to convert the course strings to a Cobalt Course object.
  var cobaltCourses = [];

  cobalt.findCourse(courses[0], function r(result) {

    // Remove the first element from the array and add the result to the array
    // of the cobalt Course objects. Note that we got the result from the
    // callback function r. It is not related to the courses array anymore at
    // this point.
    courses.splice(0, 1);
    cobaltCourses.push(result);

    // Recursively get the rest of the courses.
    if (courses.length > 0) {
      cobalt.findCourse(courses[0], r);
    } else {
      for (var i = 0; i < cobaltCourses.length; i++){//get one course
        var toDelete = [];
        var currentCourse = cobaltCourses[i];
        var meetingSections = currentCourse.meeting_sections;
        //get meeting sections to compare
        for (var j = 0; j < meetingSections.length - 1; j++){
          for (var k = j+1; k < meetingSections.length; k++){
            section1 = meetingSections[j];
            section2 = meetingSections[k];
            if (section1.times.length != section2.times.length){//meeting sections have different times, no need to compare
              continue;
            }
            for (var l = 0; l < section1.times.length; l++){
              //make sure the meeting section times and instructors are the same
              if ( section1.times.location != section2.times.location || section1.times[l].day != section2.times[l].day || 
                section1.times[l].start != section2.times[l].start || section1.times[l].end != section2.times[l].end){
                break;
              }
              //meeting sections are the same
              if (l == section1.times.length - 1){
                section2.code = section2.code + "/" + section1.code;
                toDelete.push(j);
              }
            }
          }
        }
        //remove the duplicates in backwards order
        for (var m = toDelete.length - 1; m >= 0; m--){
          var del = toDelete[m];
          cobaltCourses[i].meeting_sections.splice(del, 1);
        }
      }
      // console.log(edited[0]);
      // console.log(cobaltCourses[0].meeting_sections);
      var generate = new Generate(cobaltCourses);

      var time = new Time(generate);

      // console.log(time.a);
      // for (var i = 0; i<time.a.length; i++) {
      //   console.log("time.a[",i,"] is ", time.a[i]);
      // }

      var timesort = new Sort(time.a, "time");
      // console.log(timesort.a);

      
      // for here we should be able to do something like 
      // generate the permutations and send it to the client for display
      res.end(JSON.stringify(timesort.a));
    }

  });

  
});


module.exports = router;