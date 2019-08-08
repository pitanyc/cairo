# Cairo

Cairo is a Javascript based chat application.  

Features include:
* smileys
* sounds
* custom buddy icons
* languagues
* automatic language translations
* offline notifications
* blinkers
* and many more!

## Install Dependencies

1. Download Ant: [Apache Ant](https://ant.apache.org/)  
 _On Mac:_ [How to Apache Ant on Mac OS X](https://www.mkyong.com/ant/how-to-apache-ant-on-mac-os-x/)
2. Download TomEE: [Apache TomEE Webprofile](https://tomee.apache.org/download-ng.html)  
 _On Mac:_ ```brew install tomee-webprofile```

## Build Application

1. Run: ```ant -f build/build.xml```
2. Deploy app by creating a soft link to it:  
 ```ln -s $(pwd)/WebContent $CATALINA_HOME/webapps/cairo```
3. Navigate to: [http://localhost:8080/cairo](http://localhost:8080/cairo)
4. Login:  
 ```Username: whatever_you_like```  
 ```Password: istanbul```

## Deploy to Heroku

1. 

## Useful Tips

1. Your wallpaper, sound & blinker choices are remembered across sessions.  These are stored in cookies on the client side.
2. The *System* sends you notifications when other users login, logoff, change status, and so forth.
3. You can upload a custom wallpaper or buddy icon.  These images are stored on the server and remembered across sessions.
4. If the server goes down, or we lose connection to it, the client side notifies you via an alert immediately.
5. Notable keyboard shortcuts:  
 ```Esc: close currently in focus chat window```  
 ```Cmd + f: full screen```


## Creator

[Peter Szocs](http://www.peterszocs.com), Tech Lead at Bloomberg LP.

* http://www.peterszocs.com/
* https://medium.com/@pitanyc
* https://github.com/pitanyc
* https://www.linkedin.com/in/szocspeter
