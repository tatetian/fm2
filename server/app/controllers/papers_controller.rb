class PapersController < ApplicationController
  def new
  end
  
  def show
      current_user
      paper = Paper.find_by_id params[:id]
      render :json => paper
  end

  def exists?
      paper = Paper.find_by_sha1 params[:sha1]
      render :json => paper
  end
end
