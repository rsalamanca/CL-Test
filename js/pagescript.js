function maxNumber(arrayNumbers) {
   var highest = -1;
      for (var i = 0; i < arrayNumbers.length; i++) {
         if (arrayNumbers[i] > highest) {
            highest = arrayNumbers[i];
         }
      };
      return highest;
   }
 
function maxHeightOfElements(className) {
   var highest = 0;
   var i = 0;
   
   className.each(function() {
      if ($(this).innerHeight() > highest) {
         highest = $(this).innerHeight();
      }
      i++;
   });
   
   className.each(function(){
      if ($(this).innerHeight() < highest){
         $(this).innerHeight(highest);
	  }
   });
}

function verticalAlignThis(alignThis) {
  // console.log("Parent: " + alignThis.parent().height() + " This: " + alignThis.height());
   for(var i = 0; i<alignThis.length; i++){
      alignThis[i].css({
         marginTop: (alignThis[i].parent().height() - alignThis[i].height()) / 2
      });    
	  i++;
   }
}

function jsonToDataPoints(axisX, axisY, labelFormat) {
   var maxY = maxNumber(axisY) + 200;
   var dataPointsBackground = []; 
   var dataPointsMain = [];
   
   for (var i = 0; i < axisX.length; i++) {
      //DataPoints for color change of entire background
      dataPointsBackground.push({
         y: maxY,
         x: axisX[i]
      });

      //DataPoints for main section
      dataPointsMain.push({
         y: axisY[i],
         x: axisX[i],
         label: labelFormat[i]
      });
   }
   
   return [dataPointsBackground, dataPointsMain, maxY];
}

function onMouseover(e) {
   e.dataPoint.markerColor = "#53BBB3";
   e.dataPoint.markerBorderThickness = 0;
}

//Vertical Lines and fill
function verticalLineChart(arrayDataPoints, canvasChart) {
   var axisY = [];
   var axisX = [];
   var dataInsert = [];

   /*For each datapoint we're creating a line chart that only covers 1 point.
   This will create the illusuion of the verical lines that reaches the original point
   and the bottom of the chart.
   This plugin doesn't support that feature and this is the only work around*/
   for (var i = 0; i < arrayDataPoints.length; i++) {
      axisX[i] = arrayDataPoints[i].x;
      dataInsert[i] = {
         type: "line",
         lineColor: "#e8e9e9",
         lineThickness: 1,
         markerBorderThickness: false,
         markerSize: 0,
         tooltipContent: null,

         dataPoints: [
            {
               y: arrayDataPoints[i].y,
               x: arrayDataPoints[i].x,
               highlightEnabled: false,
               toolTipContent: null,
               lineDashType: "longDash"
            }, {
               y: 0,
               x: arrayDataPoints[i].x,
               highlightEnabled: false,
               toolTipContent: null
            },
         ]
      };
      canvasChart.options.data.push(dataInsert[i]);
   }
};

$(document).ready(function() {
   var windowWidth = window.innerWidth;

   //Chart Variables
   var axisYValue = [];
   var axisXValue = [];
   var labelValue = [];
   var dataPointsCover = [];
   var dataPointsValue = [];
   var maxYAxis = 0;
   var viewportMin = 0;
   var viewportMax = 11;
   var currentPos = 0;

   //Chart Scroll Variables
   var handleHelper = "";
   
   //Slider Variables
   var maxHeightSlides = 0;
   
   //Price Table Variables
   var heightFirstDiv = 0;
   
   //Get information from JSON
   $.ajax({
      url: "chart.json",
      dataType: "text",
      async: false,
      success: function(data) {
         var json = $.parseJSON(data);
         for (var i = 0; i < json.numbers.length; i++) {
            labelValue.push(json.numbers[i].month);
            axisYValue.push(json.numbers[i].money);
            axisXValue.push(i);
         }
	     //Temporarily store info so that the function only has to run once 
         var tempDataPointInfo = jsonToDataPoints(axisXValue, axisYValue, labelValue);
	     dataPointsCover = tempDataPointInfo[0];
	     dataPointsValue = tempDataPointInfo[1];
	     maxYAxis = tempDataPointInfo[2];
      }
   });

//START OF CANVASJS PLUGIN//
   var chart = new CanvasJS.Chart("chartContainer", {
      axisX: {
         gridThickness: 0,
         viewportMinimum: viewportMin,
         viewportMaximum: viewportMax,
         lineColor: "transparent",
         tickColor: "transparent"
      },

      axisY: {
         gridThickness: 0,
         lineColor: "transparent",
         tickColor: "transparent",
         labelFontColor: "transparent",
         maximum: (maxYAxis - 100)
      },
      backgroundColor: "#F9F9F9",

      toolTip: {
         enabled: true,
         fontColor: "#fff",
         fontStyle: "normal",
         cornerRadius: 100,
         backgroundColor: "#53BBB3",
         borderColor: "transparent",
         markerBorderThickness: 0,
         fillOpacity: 0,

         contentFormatter: function(e) {
            var content = " ";
            for (var i = 0; i < e.entries.length; i++) {
			   //Added so that I can customize the tool tip with CSS
               content += "</div><div class='toolTipContainer'><div class='speechBubble'></div><span class='toSerif circleInfo'>i</span>" + e.entries[i].dataPoint.label + ", $" + e.entries[i].dataPoint.y + "</div>";
               content += "<br/>";
            }
            return content;
         }
      },

      //Data from JSON file is sent through here and given these attributes
      data: [{
         //To Produce White Background of Chart
         highlightEnabled: false,
         type: "area",
         color: "#ffffff",
         fillOpacity: 1,
         lineThickness: 0,
         markerBorderColor: "#fff",
         markerColor: "#e1e8ee",
         markerSize: 0,
         markerBorderThickness: 0,
         tooltipContent: null,

         dataPoints: dataPointsCover
      }, {
         //Main Data Points
         type: "line",
         color: "#E1E8EE",
         fillOpacity: 0.1,
         lineThickness: 2,
         markerBorderColor: "#ffffff",
         markerColor: "#e1e8ee",
         markerSize: 10,
         markerBorderThickness: 2,
         mouseover: onMouseover,

         dataPoints: dataPointsValue
      }, {
      //Fill area of chart
         type: "area",
         color: "#F9F9F9",
         fillOpacity: 1,
         lineThickness: 2,
         tooltipContent: null,
         highlightEnabled: false,
         markerSize: 0,

         dataPoints: dataPointsValue
      }]
   });

   verticalLineChart(chart.options.data[1].dataPoints, chart);
   chart.render();
//END OF CANVASJS PLUGIN//


//START OF CHART SCROLL BAR
   var scrollbar = $(".scroll-bar").slider({
      range: 'min',
      min: 0,
      max: chart.options.data[0].dataPoints.length,
      value: chart.options.data[0].dataPoints.length / 2,
      step: 1,
      slide: function(event, ui) {
         currentPos = ui.value;
         chart.options.axisX.viewportMaximum = currentPos;

         //If statement so that the scroll wheel doesn't go below the first value.
         if (currentPos <= 5) {
            //console.log("REACHED END LOWER");
            chart.options.axisX.viewportMaximum = 12;
         //If statement so that the scroll wheel doesn't go above the last value.
         } else if (chart.options.axisX.viewportMaximum >= (chart.options.data[0].dataPoints.length - 12)) {
            //console.log("REACHED END TOP");
            chart.options.axisX.viewportMaximum = chart.options.data[0].dataPoints.length - 1;
            chart.options.axisX.viewportMinimum = chart.options.data[0].dataPoints.length - 12;
         //If statement so that the scroll wheel will update the chart to the values in between.
         } else {
            //console.log("Working inbetween");
            chart.options.axisX.viewportMinimum = currentPos - 6;
            chart.options.axisX.viewportMaximum = currentPos + 6;
         }

         chart.render();
      }
   });
   
   //Plugin code and inserted a class to show the vertical lines in the horizontal scroll bar for the chart
   handleHelper = scrollbar.find(".ui-slider-handle").append("<span class='ui-icon ui-icon-grip-dotted-vertical noUi-handle'><span class='verticalLines'>lorem</span></span>").wrap("<div class='ui-handle-helper-parent'></div>").parent();

   
//END OF CHART SCROLL BAR//
      
//START OF TESTIMONIALS//
   
   //CIRCLE CENTER BUTTON ON TESTIMONIALS
   $('.circleButton').css({
      marginTop: -($('.circleButton').height() / 2)
   });

   $('.circleButton').click(function(){
      $("html, body").animate({scrollTop:$('.testimonials').offset().top});
   });
   
   $(window).load(function(){
      $('.btn-bar').height($('#carousel').outerHeight());
      $('#buttons').css({
         marginTop: $('#carousel').outerHeight()/2 - $('#buttons').outerHeight()/2
      });
   });
   
   
//END OF TESTIMONIALS//
   
//START OF MOBILE BUTTON//
   $('.mobileButton').click(function() {
      if (parseInt($('.mainNav').css('left')) == (-310)) {
         $('.mainNav').animate({
            "left": "0px"
         }, "fast");
		 $('.cover').fadeIn('fast');
      } else {
         $('.mainNav').animate({
            "left": "-310px"
         }, "fast");
         $('.cover').fadeOut('fast');
      }
   });
//END OF MOBILE BUTTON//
   	   
   if ((windowWidth <= 900) && (windowWidth > 641)) {
        
	  $(window).load(function(){  
	     heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + parseInt($('.priceTable ul li:first-child').css('margin-right'));
		 
         $('.priceTable ul li:first-child').css({
            marginTop: heightFirstDiv
         });
         $('.priceTable ul li:last-child').css({
            marginTop: heightFirstDiv
         });
      });
	  
   } else if (windowWidth <= 640) {

      $(window).load(function(){  
         heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + parseInt($('.priceTable ul li:first-child').css('margin-right'));
		 
         $('.priceTable ul li:first-child').css({
            marginTop: heightFirstDiv
         });
         $('.priceTable ul li:last-child').css({
            marginTop: heightFirstDiv
         });
      });
   }

   verticalAlignThis([$('.price'),$('.copyright p'),$('.imageContainer img')]);
});

$(window).resize(function() {
   var windowWidth = window.innerWidth;
   var heightFirstDiv = 0;
   
      $('.btn-bar').height($('#carousel').outerHeight());
      $('#buttons').css({
         marginTop: $('#carousel').outerHeight()/2 - $('#buttons').outerHeight()/2
      });

   if ((windowWidth <= 900) && (windowWidth > 640)) {

      heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + parseInt($('.priceTable ul li:first-child').css('margin-right'));

      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:last-child').css({
         marginTop: heightFirstDiv
      });
   } else if (windowWidth <= 640) {
	   
      heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + 20;

      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      
      $('.priceTable ul li:last-child').css({
         marginTop: 20
      });
   }
   
   verticalAlignThis([$('.copyright p')]);
});