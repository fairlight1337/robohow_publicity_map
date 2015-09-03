var ctx, map_canvas;
var world_map, world_data;
var mouse_x, mouse_y;
var hovered_country;


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
    
    clear_canvas();
    
    redraw_canvas();
}


function redraw_canvas() {
    "use strict";
    
    clear_canvas();
    ctx.drawImage(world_map, 0, 0, parseInt(map_canvas.width), parseInt(map_canvas.height));
    
    hovered_country = ""
    for(var i = 0; i < world_data.length; i++) {
	if(get_links_for_country(world_data[i]["name"]).length > 0) {
	    if(mouse_is_over(world_data[i]["name"])) {
		draw_country(world_data[i]["name"], "#00ff00");
		hovered_country = world_data[i]["name"];
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
	articles.innerHTML = links.length + " Artikel";
	
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
    
    ctx.moveTo(country["polygon-points"][0]["x"] * scale_x, country["polygon-points"][0]["y"] * scale_y);
    for(var i = 1; i < country["polygon-points"].length; i++) {
	ctx.lineTo(country["polygon-points"][i]["x"] * scale_x, country["polygon-points"][i]["y"] * scale_y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function mouse_move(event) {
    "use strict";
    
    mouse_x = event.clientX - map_canvas.offsetLeft;
    mouse_y = event.clientY - map_canvas.offsetTop;
    
    redraw_canvas();
}


function mouse_down(event) {
    "use strict";
    
    if(hovered_country != "") {
	var contents = document.getElementById("article_list_contents");
	var links = get_links_for_country(hovered_country);
	
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
	    
	    contents.innerHTML += "<a target=\"_blank\" href=\"" + links[i]["url"] + "\"><div class=\"link_container " + list_class + "\"><span class=\"link_title\">" + title + "</span><span class=\"link_portal\">" + portal + "</span></div></a>";
	}
    }
}


function mouse_up(event) {
    "use strict";
}
