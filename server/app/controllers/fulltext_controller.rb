class FulltextController < ApplicationController
  before_filter :signed_in_user
  
  def index
      @docid=params[:docid]
      paper = Paper.find_by_docid(@docid)
      @paper_id = paper.id
      user = current_user
      @user_id = user.id
      @headurl = user.headurl
      #redirect_to home_path, notice: "You don't have this paper." unless current_user.has_metadata? params
  end 
  
  private
  
  def signed_in_user
      redirect_to "", notice: "Please sign in." unless signed_in?
  end
end
