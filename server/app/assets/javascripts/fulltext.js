$(function(){
  docid = $(".docid")[0].dataset["docid"];
  
  var ImageView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#fulltext-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  
  var images = new Backbone.Collection;
  
  var scroller = new Array();
  
  var x = 0;

 $.getJSON("/uploads/"+docid+"/text.json", function(data) {
        var text = data;
        var length = text.pages.length;
        for(var i = 0; i< length ; i++){
            var str = "";
            if(i+1<10){
                str = "0"+(i+1);
            }
            else str = i+1;
            var srctext = "/uploads/"+docid+"/page-"+str+".png";
            images.add([
                {pagenum:i+1,src:srctext}
            ]);
            var iv = new ImageView({model: images.at(i)});
            $(".multi-image").append(iv.render().el);
            scroller[i] = new iScroll('vwrapper'+(i+1),{
                fadeScrollbar:true,
                hideScrollbar:true,
                lockDirection:true,
                vScrollbar: false,
                hScroll:false
            });
        }
        $('#hwrapper').width(length*816);
        //$('.vw').height(window.innerHeight);
        var myScroll = new iScroll('container',{
            snap: true,
            momentum: false,
            vScroll: false,
            hideScrollbar:true,
            fadeScrollbar:true,
            lockDirection:true,
            onScrollStart: function () {
                x = this.x;
            },
            onScrollEnd: function () {
                if(x!=this.x){
                    for(var i = 0; i< length ; i++){
                          scroller[i].scrollTo(0,0,200);
                    }
                }
            }
        });
    });
});
