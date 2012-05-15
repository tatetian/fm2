class PapersController < ApplicationController
  def new
  end
  def show
      current_user
      paper = Paper.find_by_id(params[:id])
      render :json => paper
  end
end
