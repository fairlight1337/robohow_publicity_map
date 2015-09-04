/*********************************************************************
 * Software License Agreement (BSD License)
 *
 *  Copyright (c) 2015, Jan Winkler, Institute for Artificial Intelligence,
 *  Universität Bremen.
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   * Neither the name of the Institute for Artificial Intelligence,
 *     Universität Bremen, nor the names of its contributors may be
 *     used to endorse or promote products derived from this software
 *     without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 *  FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 *  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 *  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *********************************************************************/

/** \author Jan Winkler */


var ctx, map_canvas;
var world_map, world_data;
var mouse_x, mouse_y;
var hovered_country;
var selected_country;


function clear_canvas() {
    "use strict";
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, map_canvas.width, map_canvas.height);
}


function init_canvas(canvas, map) {
    "use strict";
    
    world_map = map;
    map_canvas = canvas;
    
    ctx = map_canvas.getContext("2d");
    
    var countries_without_polygon = new Array();
    var select = document.getElementById("country_list");
    
    var el = document.createElement("option");
    el.textContent = "<Select a Country>";
    el.value = "";
    select.appendChild(el);
    var country_ids = new Array();
    
    for(var country in country_data) {
	if(get_country(country).length == 0) {
	    countries_without_polygon.push(country);
	}
	
	country_ids.push(country);
    }
    
    country_ids.sort();
    
    for(var i = 0; i < country_ids.length; i++) {
	country = country_ids[i];
	
	var country_name = get_details_for_country(country)["name"];
	el = document.createElement("option");
	
	var num_links = get_links_for_country(country).length;
	el.textContent = country_name + " (" + num_links + " article" + (num_links == 1 ? "" : "s") + ")";
	el.value = country;
	select.appendChild(el);
    }
    
    //console.log(countries_without_polygon);
    
    clear_canvas();
    
    redraw_canvas();
}


function select_country(dropdown) {
    hovered_country = dropdown.value;
    do_mousedown();
}


function redraw_canvas() {
    "use strict";
    
    clear_canvas();
    ctx.drawImage(world_map, 0, 0, parseInt(map_canvas.width), parseInt(map_canvas.height));
    
    hovered_country = ""
    for(var i = 0; i < world_data.length; i++) {
	if(get_links_for_country(world_data[i]["name"]).length > 0) {
	    if(mouse_is_over(world_data[i]["name"]) || world_data[i]["name"] == selected_country) {
		if(world_data[i]["name"] == selected_country) {
		    draw_country(world_data[i]["name"], "#00ff00");
		} else {
		    draw_country(world_data[i]["name"], "#00dd00");
		}
		
		if(world_data[i]["name"] != selected_country || (mouse_is_over(world_data[i]["name"]) && world_data[i]["name"] == selected_country)) {
		    hovered_country = world_data[i]["name"];
		}
	    } else {
		draw_country(world_data[i]["name"], "#4fbf53");
	    }
	}
    }
    
    var quickdetails = document.getElementById("quickdetails");
    
    if(hovered_country != "") {
	map_canvas.style.cursor = "pointer";
	
	quickdetails.style.visibility = "visible";
	
	var quickcountry = document.getElementById("quickcountry");
	var details = get_details_for_country(hovered_country);
	quickcountry.innerHTML = details["name"];
	
	var links = get_links_for_country(hovered_country);
	var articles = document.getElementById("quickarticles");
	articles.innerHTML = links.length + " Article" + (links.length == 1 ? "" : "s");
	
	quickdetails.style.left = mouse_x + map_canvas.offsetLeft;
	quickdetails.style.top = mouse_y + map_canvas.offsetTop - 50;
    } else {
	map_canvas.style.cursor = "default";
	
	quickdetails.style.visibility = "hidden";
    }
}


function mouse_is_over(country_name) {
    country = get_country(country_name);
    
    vertx = new Array();
    verty = new Array();
    nvert = country["polygon-points"].length
    
    scale_x = map_canvas.width / world_map.width;
    scale_y = map_canvas.height / world_map.height;
    
    for(var i = 0; i < nvert; i++) {
	vertx.push(country["polygon-points"][i]["x"] * scale_x);
	verty.push(country["polygon-points"][i]["y"] * scale_y);
    }
    //console.log(scale_x);
    return pnpoly(nvert, vertx, verty, mouse_x, mouse_y);
}


// http://stackoverflow.com/questions/2212604/javascript-check-mouse-clicked-inside-the-circle-or-polygon
function pnpoly(nvert, vertx, verty, testx, testy) {
    var i, j, c = false;
    
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                c = !c;
        }
    }
    return c;
}


function get_details_for_country(country_name) {
    return country_data[country_name];
}


function get_links_for_country(country_name) {
    links = new Array();
    
    for(var i = 0; i < link_data.length; i++) {
	if(link_data[i]["country"] == country_name) {
	    links.push(link_data[i]);
	}
    }
    
    return links;
}


function get_country(country_name) {
    for(var i = 0; i < world_data.length; i++) {
	if(world_data[i]["name"] == country_name) {
	    return world_data[i];
	}
    }
    
    return [];
}


function draw_country(country_name, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000000";
    
    ctx.beginPath();
    
    country = get_country(country_name);
    
    scale_x = map_canvas.width / world_map.width;
    scale_y = map_canvas.height / world_map.height;
    
    if(country["polygon-points"].length > 0) {
	ctx.moveTo(country["polygon-points"][0]["x"] * scale_x, country["polygon-points"][0]["y"] * scale_y);
	for(var i = 1; i < country["polygon-points"].length; i++) {
	    ctx.lineTo(country["polygon-points"][i]["x"] * scale_x, country["polygon-points"][i]["y"] * scale_y);
	}
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function mouse_move(event) {
    "use strict";
    
    //console.log(event.offsetX);
    
    mouse_x = event.offsetX;//event.clientX - map_canvas.offsetLeft;
    mouse_y = event.offsetY;//event.clientY - map_canvas.offsetTop;
    
    redraw_canvas();
}


function mouse_down(event) {
    "use strict";
    
    do_mousedown();
}


function do_mousedown() {
    if(hovered_country != "") {
	selected_country = hovered_country;
	
	var contents = document.getElementById("article_list_contents");
	var links = get_links_for_country(selected_country);
	
	contents.innerHTML = "";
	
	for(var i = 0; i < links.length; i++) {
	    var title = links[i]["name"];
	    var portal = links[i]["portal"];
	    var list_class;
	    
	    if(i % 2 == 0) {
		list_class = "even";
	    } else {
		list_class = "odd";
	    }
	    
	    var article_list_country = document.getElementById("article_list_country");
	    var country = get_details_for_country(selected_country);
	    article_list_country.innerHTML = " (" + country["name"] + ")";
	    
	    contents.innerHTML += "<a target=\"_blank\" href=\"" + links[i]["url"] + "\"><div class=\"link_container " + list_class + "\"><span class=\"link_title\">" + title + "</span><span class=\"link_portal\">" + portal + "</span></div></a>";
	}
    } else {
	selected_country = "";
	
	var contents = document.getElementById("article_list_contents");
	contents.innerHTML = "Please select a country to display articles";
	
	var article_list_country = document.getElementById("article_list_country");
	article_list_country.innerHTML = "";
    }
    
    redraw_canvas();
    
    scale_x = map_canvas.width / world_map.width;
    scale_y = map_canvas.height / world_map.height;
    
    console.log("{\n\t\"x\": " + (mouse_x / scale_x) + ",\n\t\"y\": " + (mouse_y / scale_y) + "\n},");
    
    var dropdown = document.getElementById("country_list");
    dropdown.value = selected_country;
}


function mouse_up(event) {
    "use strict";
}
