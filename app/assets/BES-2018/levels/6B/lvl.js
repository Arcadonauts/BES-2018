window.level_code = (function(){ return {
  /*
  preupdate
  intraupdate - overwritten on some sprites 
  postupdate
  init
  ondeath
  */
	'aniball.png': {
       preupdate: function(){
      	if(this.body.velocity.x > 300){
            this.kill()
          }
       },
       ondeath: function(){
        	console.log('goodbye, cruel world!')
         	this.destroy()
       },
       init: function(){
         console.log(this.key)
       }
     }
  
}})()