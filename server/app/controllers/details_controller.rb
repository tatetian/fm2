class DetailsController < ApplicationController
  #before_filter :signed_in_user  
  def index
    @metadata_id = params[:metadata_id]
  end
private
  
    def signed_in_user    
        puts signed_in?
        redirect_to "" unless signed_in?
    end
end
