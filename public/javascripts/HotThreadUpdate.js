function HotThreadUpdate(){
    var HotThread;
    this.updateInterface = function(){
        var data =  HotThread;
        var d = document.getElementById("chart2");
        d.innerHTML = null;
        var graph = new HotGraphUpdate();
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


    var getData = function(){
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8000/updateHotThread',
            dataType: 'json',
            xhrFields: {
                withCredentials: false
            },
            complete: function(data) {
               //  alert(JSON.stringify(data))
                //jsonData = data.responseText;
                if (data.statusText == "OK") {
                    var newData = data.responseJSON;
                    HotThread = newData;
                    this.updateInterface();
                }
            }
        });
    }

    var redraw = function(){
            getData();
        }

    this.start = function() {

        
        //setup (includes first draw)
        redraw()

       //Repeat every 60 seconds
        setInterval(function(){
            redraw()
        }, 60000);
    }
}
