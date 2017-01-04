const snoowrap = require('snoowrap');
var keyword_extractor = require("keyword-extractor");
var sentimentAnalysis = require('sentiment-analysis');
// 定义存放keyword object的List
var List = require("collections/list");

const r = new snoowrap({
  userAgent: '/u/Goldensights python reddit thread 17 project',
  clientId: 'ud8KimdSfrFujw',
  clientSecret: 'rnxmIK_98BpP709Dn2d8ocz-vqY',
  refreshToken: '65326677-KgFV9GAG4j-cLsGWCvQnW4YQiT4'
});

// 创建存放thread object的array
var HotThreadsJSON;



// 定义kRectangle in TreeMap

function Thread(threadId, title, titleKeyword, urls, score, subReddit, comment_dis, dis0, dis1,dis2, dis3, dis4, dis5,
 dis6, dis7, dis8,dis9,dis10,dis11,dis12,dis13,dis14,dis15,dis16,dis17,dis18,dis19,dis20,dis21,dis22,dis23, max, sentiment,comment1, comment2){
    this.threadId = threadId;
    this.title = title;
    this.titleKeyword = titleKeyword;
    this.urls = urls;
    this.score = score;
    this.subReddit = "\u26F1" + " "+subReddit;
    this.value = 50;
    this.comment_dis = comment_dis;
    this.sentiment = sentiment;
    this.radius = 5;
    this.leaf = "\u2665\u2665\u2665";
    this.dis0 =  dis0;
    this.dis1 =  dis1;
    this.dis2 =  dis2;
    this.dis3 =  dis3;
    this.dis4 =  dis4;
    this.dis5 =  dis5;
    this.dis6 =  dis6;
    this.dis7 =  dis7;
    this.dis8 =  dis8;
    this.dis9 =  dis9;
    this.dis10 =  dis10;
    this.dis11 =  dis11;
    this.dis12 =  dis12;
    this.dis13 =  dis13;
    this.dis14 =  dis14;
    this.dis15 =  dis15;
    this.dis16 =  dis16;
    this.dis17 =  dis17;
    this.dis18 =  dis18;
    this.dis19 =  dis19;
    this.dis20 =  dis20;
    this.dis21 =  dis21;
    this.dis22 =  dis22;
    this.dis23 =  dis23;
    this.max = max;
    this.titleBarChart = "Comment Distribution along time";
    this.times = "Time";
    this.emoji = "";
    this.comment1 = comment1;
    this.comment2 = comment2;
}

function update_hour_array(hour,record_array){
  switch(hour){
    case 0:
      record_array[0]+=1;
      break;
    case 1:
      record_array[1]+=1;
      break;
    case 2:
      record_array[2]+=1;
      break;
    case 3:
      record_array[3]+=1;
      break;
    case 4:
      record_array[4]+=1;
      break;
    case 5:
      record_array[5]+=1;
      break;
    case 6:
      record_array[6]+=1;
      break;
    case 7:
      record_array[7]+=1;
      break;
    case 8:
      record_array[8]+=1;
      break;
    case 9:
      record_array[9]+=1;
      break;
    case 10:
      record_array[10]+=1;
      break;
    case 11:
      record_array[11]+=1;
      break;
    case 12:
      record_array[12]+=1;
      break;
    case 13:
      record_array[13]+=1;
      break;
    case 14:
      record_array[14]+=1;
      break;
    case 15:
      record_array[15]+=1;
      break;
    case 16:
      record_array[16]+=1;
      break;
    case 17:
      record_array[17]+=1;
      break;
    case 18:
      record_array[18]+=1;
      break;
    case 19:
      record_array[19]+=1;
      break;
    case 20:
      record_array[20]+=1;
      break;
    case 21:
      record_array[21]+=1;
      break;
    case 22:
      record_array[22]+=1;
      break;
    case 23:
      record_array[23]+=1;
      break;
  }
}

function getTop30(){
  var countdownLatch = 30;
  var list = []; //
  var count = 0;
  var a = true;
  var statics_array = new Array(24);
  statics_array.fill(0);
  var threadId = 0;
  var title = 0;
  var urls = 0;
  var score = 0;
  var subReddit = 0;
  var titleKeyword = 0;
  var sentiment = 0;
  var cbody=[];
	r.getHot({time:'all', limit:30}).then(function(object){
								                  return Promise.all(object);
                  								}).each(// t表示 每一个thread
                                    function(t){
                                      //console.log("enter the each")
                                      //  r.getSubmission('4j8p6d').expandReplies({limit: 10, depth: 1}).then(console.log)
                                            r.getSubmission(t.id).expandReplies({limit:5,depth:1})
                                            .then(
                                              function(object){
                                                a = false;

                                                threadId = t.id
                                                sentiment = 0;
                                                title = t.title

                                                urls = t.url
                                                score = t.score
                                                subReddit = t.subreddit["display_name"]
                                                titleKeyword =  keyword_extractor.extract(title,{
                                                                                language:"english",
                                                                                remove_digits:true,
                                                                                return_changed_case:true,
                                                                                return_chained_words: false,
                                                                                // 去掉dupulicates
                                                                                remove_duplicates: true
                                                                              })

                                              return Promise.all(object.comments)
                                              }
                                            ).each(
                                              function(c){
                                                cbody.push(c.body);
                                                sentiment = sentiment + sentimentAnalysis(c.body);
                                                var createdTime = new Date(c.created_utc*1000);
                                                // 统计每个小时段的comment量
                                                var hour = createdTime.getHours();
                                                update_hour_array(hour,statics_array);
                                                // console.log(statics_array);
                                              }
                                            ).then(
                                              function(){

                                                var thread = new Thread(threadId, title, titleKeyword, urls, score, subReddit, statics_array, sentiment, cbody[0], cbody[1]);
                                              //  if(list[list.length - 1].threadId != threadId){
                                                if(list.length == 0){
                                                    list.push(new Thread(threadId, title, titleKeyword, urls, score, subReddit, statics_array,statics_array[0],statics_array[1],
                                                      statics_array[2],statics_array[3],statics_array[4],statics_array[5],statics_array[6],statics_array[7],statics_array[8],
                                                      statics_array[9],statics_array[10],statics_array[11],statics_array[12],statics_array[13],statics_array[14],statics_array[15],
                                                      statics_array[16],statics_array[17],statics_array[18],statics_array[19],statics_array[20],statics_array[21],statics_array[22],
                                                      statics_array[23], Math.max.apply(null, statics_array), sentiment, cbody[cbody.length-1], cbody[cbody.length-2]));
                                                }else if(list[list.length - 1].threadId != threadId){
                                                      list.push(new Thread(threadId, title, titleKeyword, urls, score, subReddit, statics_array,statics_array[0],statics_array[1],
                                                      statics_array[2],statics_array[3],statics_array[4],statics_array[5],statics_array[6],statics_array[7],statics_array[8],
                                                      statics_array[9],statics_array[10],statics_array[11],statics_array[12],statics_array[13],statics_array[14],statics_array[15],
                                                      statics_array[16],statics_array[17],statics_array[18],statics_array[19],statics_array[20],statics_array[21],statics_array[22],
                                                      statics_array[23], Math.max.apply(null, statics_array), sentiment, cbody[cbody.length-1], cbody[cbody.length-2]));
                                                }

                                                statics_array = new Array(24);
                                                statics_array.fill(0);
                                                countdownLatch --;
                                                 //console.log(countdownLatch);
                                                //console.log(countdownLatch)
                                                if(countdownLatch==0){
                                                     //  console.log(list);
                                                     list.sort(function(a, b){
                                                        return a.threadId - b.threadId;
                                                     });
                                                     console.log(list);
                                                      HotThreadsJSON = JSON.stringify(list);
                                                      if(typeof(HotThreadsJSON) !== 'undefined'){
                                                        exports.HotThreadsJSON = HotThreadsJSON;
                                                      }
                                                     // getTop30();
                                                }

                                              }
                                            )
                                        });
 }

 exports.getTop30 = getTop30;
