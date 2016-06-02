function maxNumber(arrayNumbers) {
   var highest = -1;
      for (var i = 0; i < arrayNumbers.length; i++) {
         if (arrayNumbers[i] > highest) {
            highest = arrayNumbers[i];
         }
      };
      return highest;
   }
 
function maxNumberElement(className) {
   var highest = -1;
   var i = 0;
   className.each(function() {
      if ($(this).outerHeight() > highest) {
         highest = $(this).outerHeight();
      }
      i++;
   });
   return highest;
}

function sameHeight(block1, block2) {
   if (block1.outerHeight() > block2.outerHeight()) {
      block2.outerHeight(block1.outerHeight());
   } else {
      block1.outerHeight(block2.outerHeight());
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

function verticalAlignThis(alignThis) {
   alignThis.css({
      marginTop: (alignThis.parent().height() - alignThis.height()) / 2
   });
}

$(document).ready(function() {
   var windowWidth = window.innerWidth;
   //Slider Variables
   var maxHeightSlides = 0;

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
   var scrollPane = $(".scroll-pane");
   var position = 0;
   
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

//START OF CANVASJS PLUGIN
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
            content += "</div><div class='toolTipContainer'><div class='speechBubble'></div><span class='toSerif circleInfo'>i</span>" + e.entries[i].dataPoint.label + ", $" + e.entries[i].dataPoint.y + "</div>";
            content += "<br/>";
         }
         return content;
      }
   },

   backgroundColor: "#F9F9F9",
   
   //Data from JSON file is sent through here and given these attributes
   data: [{
      //Top White Background
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
      //Main Data
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
      //Lower Line Background
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
//END OF CANVASJS PLUGIN


//START OF CHART SCROLL BAR
var scrollbar = $(".scroll-bar")
   .slider({
      range: 'min',
      min: 0,
      max: chart.options.data[0].dataPoints.length,
      value: chart.options.data[0].dataPoints.length / 2,
      step: 1,
      slide: function(event, ui) {
         currentPos = ui.value;
         chart.options.axisX.viewportMaximum = currentPos;

         //slide down
         if (currentPos <= 5) {
            console.log("REACHED END LOWER");
            chart.options.axisX.viewportMaximum = 12;
         } else if (chart.options.axisX.viewportMaximum >= (chart.options.data[0].dataPoints.length - 12)) {
            console.log("REACHED END TOP");
            chart.options.axisX.viewportMaximum = chart.options.data[0].dataPoints.length - 1;
            chart.options.axisX.viewportMinimum = chart.options.data[0].dataPoints.length - 12;
         } else {
            console.log("Working inbetween");
            chart.options.axisX.viewportMinimum = currentPos - 6;
            chart.options.axisX.viewportMaximum = currentPos + 6;
         }

         chart.render();
      }
   });

var handleHelper = scrollbar.find(".ui-slider-handle").append("<span class='ui-icon ui-icon-grip-dotted-vertical noUi-handle'><span class='verticalLines'>lorem</span></span>").wrap("<div class='ui-handle-helper-parent'></div>").parent();
scrollPane.css("overflow", "hidden");
//END OF CHART SCROLL BAR
   
   $("#slides").slidesjs({
      width: 940,
      height: 500,
      pagination: {
         active: false,
      },
      play: {
         auto: false,
         pauseOnHover: true
      },
      effect: {
         slide: {
            speed: 5000
         }
      },
   });

   $('.slidesjs-previous').ready(function() {
      $('.slidesjs-previous').html("<div class='leftNav'></div>");
      $('.slidesjs-next').html("<div class='rightNav'></div>");
   });

   $(window).load(function() {
      maxHeightSlides = maxNumberElement($('.slideContents'));
      verticalAlignThis($('.slidesjs-navigation'));
   });

   $('.mobileButton').click(function() {
      if (parseInt($('.mainNav').css('left')) == (-310)) {
         $('.mainNav').animate({
            "left": "0px"
         }, "fast");
         $('.cover').css({
            display: "initial"
         }).animate({
            "background-color": "rgba(0,0,0,0.5)"
         }, "fast");
      } else {
         $('.mainNav').animate({
            "left": "-310px"
         }, "fast");
         $('.cover').animate({
            "background-color": "rgba(0,0,0,0.0)"
         }, "fast").animate({
            "display": "none"
         }, 0);
      }
   });
   
   $('.circleButton').css({
      marginTop: -($('.circleButton').height() / 2)
   });

   $('.circleButton').click(function(){
      $("html, body").animate({scrollTop:$('.testimonials').offset().top});
   });
   
   sameHeight($('.emailInput'), $('.emailButton'));

   $('.priceTable li>p:first-of-type').height(maxNumberElement($('.priceTable li>p:first-of-type')));

   verticalAlignThis($('.price'));
   verticalAlignThis($('.imageContainer img'));
   verticalAlignThis($('.copyright p'));
   
   if ((windowWidth <= 900) && (windowWidth > 641)) {
      //$('.testimonials>div').attr("id","slides").attr("style");
      $('#slides>div').attr("class", "slidesjs-container");
      $('.slidesjs-container>div').attr("class", "slidesjs-control");
      $('slidesjs-control>div').removeAttr("class", "slide slidesjs-slide");
      //$('.slides').removeAttr( "class style" );

      $('.priceTable ul li:nth-child(2)').children('p').css({
         height: 'auto'
      });
      $('.priceTable ul li:nth-child(2) .price').css({
         marginTop: 0
      });
      
      var heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + parseInt($('.priceTable ul li:first-child').css('margin-right'));


      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:last-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:first-child .price').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child .price').css({
         marginTop: 0
      });
   } else if (windowWidth <= 640) {
      //$('#slides').removeAttr( "id style" );
      $('.slidesjs-container').removeAttr("class style");
      $('.slidesjs-control').removeAttr("class style");
      $('.slide.slidesjs-slide').removeAttr("class style");
      $('#slides *').removeAttr("style");

      $('.priceTable ul li:nth-child(2)').children('p').css({
         height: 'auto'
      });
      $('.priceTable ul li:nth-child(2) .price').css({
         marginTop: 0
      });

      heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + 20;

      $('.priceTable ul li:first-child .price').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child .price').css({
         marginTop: 0
      });

      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:last-child').css({
         marginTop: 20
      })
   }
});

$(window).resize(function() {
   var windowWidth = window.innerWidth;
   verticalAlignThis($('.copyright p'));

   if(windowWidth>900){
      $('.priceTable ul li:nth-child(2)').children('p').css({
         height: $('.priceTable ul li:first-child p').height()
      });
      $('.priceTable ul li:nth-child(2) .price').css({
         marginTop: 0
      });
      
      $('.priceTable ul li:first-child').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child').css({
         marginTop: 0
      }); 
      $('.priceTable ul li:first-child .price').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child .price').css({
         marginTop: 0
      }); 
         sameHeight($('.emailInput'), $('.emailButton'));

      verticalAlignThis($('.price'));
      verticalAlignThis($('.slidesjs-navigation'));
      
   }
   else if ((windowWidth <= 900) && (windowWidth > 641)) {
      //$('.testimonials>div').attr("id","slides").attr("style");
      $('#slides>div').attr("class", "slidesjs-container");
      $('.slidesjs-container>div').attr("class", "slidesjs-control");
      $('slidesjs-control>div').removeAttr("class", "slide slidesjs-slide");
      //$('.slides').removeAttr( "class style" );
      verticalAlignThis($('.slidesjs-navigation'));

      var heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + parseInt($('.priceTable ul li:first-child').css('margin-right'));
      $('.priceTable ul li:nth-child(2)').children('p').css({
         height: 'auto'
      });
      $('.priceTable ul li:nth-child(2) .price').css({
         marginTop: 0
      });

      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:last-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:first-child .price').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child .price').css({
         marginTop: 0
      });
         sameHeight($('.emailInput'), $('.emailButton'));

   } else if (windowWidth <= 640) {
      //$('#slides').removeAttr( "id style" );
      $('.slidesjs-container').removeAttr("class style");
      $('.slidesjs-control').removeAttr("class style");
      $('.slide.slidesjs-slide').removeAttr("class style");
      $('#slides *').removeAttr("style");

      $('.priceTable ul li:nth-child(2)').children('p').css({
         height: 'auto'
      });
      $('.priceTable ul li:nth-child(2) .price').css({
         marginTop: 0
      });

      heightFirstDiv = $('.priceTable ul li:nth-child(2)').outerHeight() + 20;

      $('.priceTable ul li:first-child .price').css({
         marginTop: 0
      });
      $('.priceTable ul li:last-child .price').css({
         marginTop: 0
      });

      $('.priceTable ul li:first-child').css({
         marginTop: heightFirstDiv
      });
      $('.priceTable ul li:last-child').css({
         marginTop: 20
      })
   }
});