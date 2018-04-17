window.level_code = (function(){ return {
  /*
  preupdate
  intraupdate - overwritten on some sprites 
  postupdate
  init
  ondeath
  begin_contact(this_sprite, other_sprite, equation)
  end_contact(this_sprite, other_sprite, equation)
  */
  'player': {
    begin_contact: function(that, other, eq){
    		if(!other.body.data.shapes[0].sensor){
            console.log(that.lose()) 
          }
    }
  },
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