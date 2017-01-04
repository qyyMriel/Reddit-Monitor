function ThreadUpdate(){
    var TopThread;
    function updateInterface(){
        var data = TopThread;
        var d = document.getElementById("chart");
        d.innerHTML = null;
        var graph = new graphUpdate();
        var array = [];

        if(typeof(data) != 'undefined'){
            var temp = "";
            for(o in data){
                if(data[o].threadId != temp && data[o] != 'undefined'){
                    if((data[o].sentiment/20) > 0.1){data[o].emoji = "\u263A";}
                    else if((data[o].sentiment/20) < -0.1){data[o].emoji = "\u2639";}
                    else{data[o].emoji = "";}
                    if(data[o].comment1 == data[o].comment2){data[o].comment2 = "";}    
                    data[o].titleKeyword = data[o].titleKeyword.slice(0,3);
                    data[o].title = data[o].title.slice(0,53);
                    array.push(data[o]);
                    temp = data[o].threadId;
                }

            }
        }
        console.log(array);

        graph.start(array);



    }


    var getData = function(callback){
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8000/updateThread',
            dataType: 'json',
            xhrFields: {
                withCredentials: false
            },
            complete: function(data) {
      
                if (data.statusText == "OK") {
                    var newData = data.responseJSON;
                    TopThread = newData;
                    callback();
                }
            }
        });
    }

    var retext = function(text){
        $("#text").text(text);
    }

    var redraw = function(){
            getData(updateInterface);
        }

    this.start = function() {

       
        //setup (includes first draw)
        redraw()
        var interval = 60000;
       // Repeat every 60 seconds

        setInterval(function(){
            redraw()
        }, interval+1);



        var count = interval/1000;
        setInterval(function(){
            count = interval/1000;
        }, interval+1);
        setInterval(function(){
            retext(count--);
        }, 1000);
    }
}
