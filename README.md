#Visualizing Reddit Monitor

<b>Author</b>: Yi Qin , He Huang
If you want to run the code locally, you should install several package:
<b>npm install express, collections, snoowrap, keyword-extractor, ejs</b>.



###How to run code locally

1. <b>Run server</b><br>
Go to Reddit file and type node app.js to run the server

2. <b>Go to webpage</b><br>
Type localhost:8000 in browser 

### Techniques and Data source
Front-end framework is modified treemap implemented with d3.js

Back-end framework is built on Node.js. 

Reddit data is extracted by "snoowrap" npm package.
 
## Description

### Problem statement

<b>Our project aims to help investigators explore what’s going on Reddit, what top threads are and the attitude of people on these threads and what time people contribute to these threads.</b> 

### Solution
We build a modified treemap to display the threads of Reddit. Our modified treemap has three levels to show the detailed information of thread. If you want explore more, you can find the demo link below and our final report

<b>Here is our sreenshot of project</b>

![alt Image of First Level](https://github.com/qyyMriel/Reddit-Monitor/blob/master/png/Hot1.png?raw=true)

![alt Image of Second Level](https://github.com/qyyMriel/Reddit-Monitor/blob/master/png/Top2.png?raw=true)

![alt Image of Third Level](https://github.com/qyyMriel/Reddit-Monitor/blob/master/png/Top33.png)

###Link

A live demo can be found here [link](https://vimeo.com/196916683)

A heroku live app can be found here [link](http://redditmonitor17.herokuapp.com/)

You may need to wait for a moment because the server is extracting data from Reddit

A final project report can be found here [link](https://github.com/qyyMriel/Reddit-Monitor/tree/master/IVProjectFinalReport.pdf)








  










