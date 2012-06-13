class HomeController < ApplicationController
    #before_filter :signed_in_user
    def index
      user = current_user
      @name = user.name
      @headurl = user.headurl
      @papersNum = 0
      @friendsNum = 2
    end
private
  
    def signed_in_user    
        puts signed_in?
        redirect_to "" unless signed_in?
    end
end
