todo-applications
=================


About this repository : 
The objective here is to learn about various JS MVC frameworks. What better way than to implement simple TODO-applications in each of the ones I wish to explore. 
Along the way would try to learn and explore other stuff as well while implementing these MVC applications like local-storage, various css-properties, frameworks
et al. 

Demo-link : 
Currently they are NOT hosted. Would host them soon somewhere. 


Please find below more information about each of the following MVC implementations. 


basic-js-mvc
============

Learning-objective while implementing this application : 

1) To implement the TODO application using the strict MVC model following observer, strategy and composite pattern. 
2) As I have always used jQuery before and have never used the native JS APIs before, so I decided to deliberately NOT use jQuery here and explore and use
	the native JS APIs. Using jQuery would have surely made the size of the code smaller. 
3) To use the functional way of object-creation based upon module-pattern. 


Things I missed or ignored for this implementation :
 
1) The js and css should have been in their independent files for modularity.
2) Currently on each update in the model, even the smaller ones the entire view redraws itself. This might become latent as each entry's UI become more complex
   and as the number of entries increase. But for the purpose of this exercise to keep the view simple, I decided to go ahead with this.
3) As mentioned above I have deliberately used the addEventListener(). The down-side of this is the code would NOT work in <=IE8 since they use attachEvent() for 
	that in those browsers. Again for the purpose of this exercise I decided to ignore it since it works fine in IE9/10.
4) The composite pattern is NOT followed strictely here. MORE TO ADD HERE. 
5) I should have used a different view for the head-area with add-button to make it more object-oriented and testing-friendly. Again I deliberately decided to 
	ignore this. 
6) Saving the data on server-side/local-storage. 