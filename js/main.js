(function ($) {
    SIM = {
        init: function(initParams){
            //Initialization
            this.data = {
                "Japan": ["Australia", "Iraq"],
                "Jordan": ["Australia", "Oman"],
                "Australia": ["Japan", "Jordan", "Iraq"],
                "Oman": ["Jordan", "Iraq"],
                "Iraq": ["Japan", "Australia", "Oman"],
                "teams": ["Japan", "Jordan", "Australia", "Oman", "Iraq"],
                "points": [13, 7, 6, 6, 5],
                "places": 2
            };
            
            this.preComputeMatches();
            this.preCompute(this.TotalComputedMatch.length);
            this.initTableTab();
            this.initTeamClick();
            this.initLightBox();
        },
        preComputeMatches: function(){
            //Computing all Remaining Matches
            this.TotalComputedMatch = [];
            var teamLen = this.data.teams.length;
            for (var i=0;i<teamLen;i++) {
                var InLen = this.data[this.data.teams[i]].length;
                for (var j=0;j<InLen;j++) {
                    if ($.inArray(this.data[this.data.teams[i]][j] +"-" +this.data.teams[i], this.TotalComputedMatch) < 0) {
                        this.TotalComputedMatch.push(this.data.teams[i] + "-" + this.data[this.data.teams[i]][j]);
                    }
                }
            }  
        },
        preCompute: function(maxMatch){
            //Initialization
            var value = ["W", "L", "D"];
            var points = [3, 0, 1];
            var initial = value;
            var initPoints = points;
            var matches = maxMatch;
            this.ComputedData = {
                "match0": ["W", "L", "D"],
                "matchPoints0": [3, 0, 1]
            };
             
            //Simulation for more than one
            var leng = initial.length;
            for(var n=0;n<matches-1;n++){
                var len = value.length;
                var setVal = [];
                var setPoints = [];
                for(var i=0;i<len;i++){
                    for(var j=0;j<leng;j++){
                        var temp = value[i] + " " + initial[j];
                        var poiTemp = points[i] + initPoints[j];
                        setVal.push(temp);
                        setPoints.push(poiTemp);
                    }
                }
                value = setVal;
                points = setPoints;
                this.ComputedData["match"+ (n+1) +""] = value;
                this.ComputedData["matchPoints"+ (n+1) +""] = points;
            }
        },
        initTableTab: function(){
            $('.select-button').click(function(){
                if (!$(this).hasClass('selected')) {
                    $('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    $('.table-tab').each(function(index){
                        $(this).toggle();
                    });
                }
            });
        },
        initTeamClick: function(){
            $('#one-column-emphasis td a').click(function(e){
                e.preventDefault();
                var team = $(this).html();
                
                //Compute the remaining matches apart from selected teams'
                var temp = [];
                SIM.ownMatches = [];
                var teamLen = SIM.data[team].length;
                for (var i=0;i<teamLen;i++) {
                    temp.push(SIM.data[team][i] + "-" + team);
                    temp.push(team + "-" + SIM.data[team][i]);
                    SIM.ownMatches.push(team + "-" + SIM.data[team][i]);
                }
                SIM.remainingMatches = [];
                var matchLen = SIM.TotalComputedMatch.length;
                for (var i=0;i<matchLen;i++) {
                    if ($.inArray(SIM.TotalComputedMatch[i], temp) < 0) {
                        SIM.remainingMatches.push(SIM.TotalComputedMatch[i]);
                    }
                }
                
                //All victory Computation
                var value = ["W", "L", "D"];
                var valOpp = [0, 3, 1];
                var points = [3, 0, 1];
                var len = SIM.data[team].length;
                var leng = SIM.ComputedData["match"+ (len-1) +""].length;
                SIM.setOrUnset = [];
                for (var i=0;i<leng;i++) {
                    var computedPoints = SIM.data.points.slice();
                    var split = SIM.ComputedData["match"+ (len-1) +""][i].split(" ");
                    var lengt = split.length;
                    for (var j=0;j<lengt;j++) {
                        var index = $.inArray(split[j], value);
                        var splitTeam = SIM.ownMatches[j].split('-');
                        var indexTeam = $.inArray(splitTeam[0], SIM.data.teams);
                        computedPoints[indexTeam] += points[index];
                        var indexTeam = $.inArray(splitTeam[1], SIM.data.teams);
                        computedPoints[indexTeam] += valOpp[index];
                    }
                    //At this point, Start computing the same for other matches
                    var lenI = SIM.remainingMatches.length;
                    var lengI = SIM.ComputedData["match"+ (lenI-1) +""].length;
                    var confirm = [0, 0, 0];
                    for (var k=0;k<lengI;k++) {
                        var IntermediatePoints = computedPoints.slice();
                        var split = SIM.ComputedData["match"+ (lenI-1) +""][k].split(" ");
                        var lengtI = split.length;
                        for (var l=0;l<lengtI;l++) {
                            var index = $.inArray(split[l], value);
                            var splitTeam = SIM.remainingMatches[l].split('-');
                            var indexTeam = $.inArray(splitTeam[0], SIM.data.teams);
                            IntermediatePoints[indexTeam] += points[index];
                            var indexTeam = $.inArray(splitTeam[1], SIM.data.teams);
                            IntermediatePoints[indexTeam] += valOpp[index];
                        }
                        
                        //Here comparing all Array for places
                        var TeamIndex = $.inArray(team, SIM.data.teams);
                        var teamValue = IntermediatePoints[TeamIndex];
                        IntermediatePoints.sort(SIM.SortingNumber);

                        //Condition for checking Confirm, Not Sure and NO
                        var place = SIM.data.places - 1;
                        if (teamValue > IntermediatePoints[place] || (teamValue == IntermediatePoints[place] && teamValue != IntermediatePoints[place + 1])) {
                            confirm[0] += 1; //CONFIRM
                        }
                        else if (teamValue < IntermediatePoints[place]) {
                            confirm[2] += 1; //FAILED
                        }
                        else{
                            confirm[1] += 1; //NOT SURE
                        }
                    }
                    SIM.setOrUnset.push(confirm);
                }
                
                var resultString = ["Guaranteed Qualification", "Still in Race", "No Qualification"];
                var div = '<h1>'+ team +'</h1>';
                div += '<table id="one-column-emphasis" class="combination-table" summary="Standings"><colgroup><col></colgroup><thead>';
                div += '<tr>';
                var len = SIM.data[team].length;
                for (var i=0;i<len;i++) {
                    div += '<th rowspan="2" scope="col">'+ SIM.data[team][i] +'</th>';
                }
                div += '<th rowspan="2" scope="col">Points</th>';
                div += '<th colspan="3">Number of Possible ways in %</th>';
                div += '<th rowspan="2" scope="col">Most Likely Outcome</th>';
                div += '</tr>';
                div += '<tr>';
                div += '<th scope="col">Guaranteed Qualification</th>';
                div += '<th scope="col">Still In Race</th>';
                div += '<th scope="col">No Qualification</th>';
                div += '</tr>';
                div += '</thead><tbody>';
                var leng = SIM.ComputedData["match"+ (len-1) +""].length;
                for (var i=0;i<leng;i++) {
                    div += '<tr>';
                    var split = SIM.ComputedData["match"+ (len-1) +""][i].split(" ");
                    var lengt = split.length;
                    for (var j=0;j<lengt;j++) {
                        div += '<td>'+ split[j] +'</td>';
                    }
                    div += '<td>'+ SIM.ComputedData["matchPoints"+ (len-1) +""][i] +'</td>';
                    var setLen = SIM.setOrUnset[i].length;
                    var total = 0;
					for (var l=0;l<setLen;l++) {
                        total += SIM.setOrUnset[i][l];
                    }
                    for (var l=0;l<setLen;l++) {
                        div += '<td>'+ ((SIM.setOrUnset[i][l] / total) * 100).toFixed(2) +'%</td>';
                    }
                    if (SIM.setOrUnset[i][1] <= 0 && SIM.setOrUnset[i][2] <= 0) {
                        div += '<td>'+ resultString[0] +'</td>';
                    }
                    else if (SIM.setOrUnset[i][0] <= 0 && SIM.setOrUnset[i][1] <= 0) {
                        div += '<td>'+ resultString[2] +'</td>';
                    }
                    else div += '<td>'+ resultString[1] +'</td>';
                    div += '</tr>';
                }
                div += '</tbody></table>';
                  
                $('#combinations').html(div);   
                    
                $('html, body').animate({
                    scrollTop: $("#combinations h1").offset().top
                }, 1000);
                
                $('#light').show();
                $('#fade').show();
                
                $('#fade').animate({'left': 0}, 600, function(){
                    $('#light').animate({'top': 0}, 800);
                });
            });
        },
        initLightBox: function(){
            $('#fade').click(function(){
                animFadeLight(this);
            });
            
            $('.close').click(function(){
                animFadeLight('#fade');
            });
            
            function animFadeLight(that) {
                $('#light').animate({'top': -1200}, 800, function(){
                    $('#fade').animate({'left': -2000}, 600, function(){
                        $('#light').hide();
                        $(that).hide();
                    });
                });
            }
        },
        SortingNumber: function(a, b){
            return a - b;
        }
    }
})(jQuery);
