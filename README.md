todo-applications
=================


About this repository : 
The objective here is to learn about various JS MVC frameworks. What better way than to implement simple TODO-applications in each of the ones I wish to explore. <br>
Along the way would try to learn and explore other stuff as well while implementing these MVC applications like local-storage, various css-properties, frameworks
et al. 

Demo-link : 
Currently they are NOT hosted. Would host them soon somewhere. 


Please find below more information about each of the following MVC implementations. 


basic-js-mvc
============

Learning-objective while implementing this application : 

1) To implement the TODO application using the strict MVC model following observer, strategy and composite pattern. <br>
2) As I have always used jQuery before and have never used the native JS APIs before, so I decided to deliberately NOT use jQuery here and explore and use
	the native JS APIs. Using jQuery would have surely made the size of the code smaller. <br>
3) To use the functional way of object-creation based upon module-pattern. <br>


Things I missed or ignored for this implementation :

1) The js and css should have been in their independent files for modularity.<br>
2) Currently on each update in the model, even the smaller ones the entire view redraws itself. This might become latent as each entry's UI become more complex
   and as the number of entries increase. But for the purpose of this exercise to keep the view simple, I decided to go ahead with this.<br>
3) As mentioned above I have deliberately used the addEventListener(). The down-side of this is the code would NOT work in <=IE8 since they use attachEvent() for 
	that in those browsers. Again for the purpose of this exercise I decided to ignore it since it works fine in IE9/10.<br>
4) The composite pattern is NOT followed strictely here. MORE TO ADD HERE. <br>
5) I should have used a different view for the head-area with add-button to make it more object-oriented and testing-friendly. Again I deliberately decided to 
	ignore this. <br>
6) Saving the data on server-side/local-storage. <br>
7) Instead of attaching events to individual list-items, event-delegation should have been used. 


backbone-implementation
=======================

Learning-objective while implementing this application : 

1) To understand backbone-framework and get-familiarized and use the basic backbone functionalities. <br>
2) To understand the use of client-side templates and use them. I have used underscore-library's template. <br>
3) To provide a local-storage backup to save the lists and their states. Have used a localStorage-library-add for backbone. <br>
4) Implement couple of more features than the basic implementation like : a) Filters. b) Edit-TODO support. <br>


Things which are better than the previous basic-implementation : 

1) In the basic-mvc implementation, the entire view redraws itself even on smaller updates like markToDo. This has been fixed in this 
   implementation and only the portions which need an update are redrawn/changed. <br>
2) The composite-pattern is followed in this implementation. Each list-item has its own view. This I guess has helped in 2 ways : <br>
   (a) One-clas, one-responsibility. There is a clear segregation of logic and listItemView owns the responsibility which deals with only 
       list-items. <br>
   (b) Helped in keeping the main view class's size in check. <br>
3) The use of client-templates has helped in keeping the JS code clean and segregated business-logic (Javascript) and presentation-logic (css/html) 
   to a decent extent. <br>
4) Overall I feel the backbone APIs abstracted out the petty details and helped me concentrate on the business-logic implementation 
   and it was easier to add features once the basic structure was in place. <br>

Things I missed or ignored for this implementation because of the lack of time:

1) More comments were certainly required. <br>
2) Couldn't implement some minor TODOs (mentioned in the comments) which could have cleaned the code further.<br>
3) Each module could be divided into their seperate JS files. <br>
4) Currently all the methods are public even the ones which should be private. This is bad. I couldn't find an easy way in backbone to 
     have private methods/variables. I would further investigate into this on what is the recommended way in backbone to attain privacy. <br>
5) The initialization code could be made better. <br>
6) Though I have tried to handle most of the edge-cases, there is a known issue : " If say on complete filter type and click on down, 
   even if there is only one value, would move down if total there are many. In other words, up-down keys should be filter-aware". 
   Did NOT get a chance to fix this. <br>

Few points to think over/investigate: 

1) Events associated to each items are a good candidate for event-delegation. Does backbone attach events using delegation internally ? <br>
2) Does this implementation abide by the rule to minimize layout-reflows ? I guess yes mostly. Need to think more. <br>