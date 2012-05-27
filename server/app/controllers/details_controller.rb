class DetailsController < ApplicationController
  #before_filter :signed_in_user  
  def index
    user = current_user
    @headurl = user.headurl
    @metadata_id = params[:metadata_id]
    metadata = Metadata.find_by_id(@metadata_id)
    @paper_id = metadata.paper.id
    @docid = metadata.docid
    @title = metadata.title
    if @title == nil
        @title = metadata.paper.title
    end
  end
private
  
    def signed_in_user    
        puts signed_in?
        redirect_to "" unless signed_in?
    end
end
