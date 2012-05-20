class UsersController < ApplicationController
  def new
  @user = User.new
  end

  def show
  @user = User.find(params[:id])
  #if current_user? @user  
      render :json => @user
  end
  
   def create
    @user = User.new(params[:user])
    if @user.save
      sign_in @user
      Tag.create :name => "All", :user_id =>  @user.id
      flash[:success] = "Welcome to the Sample App!"
      redirect_to "/manager"
    else
      render 'new'
    end
  end
  def getTags
      render :json=> current_user.tags
  end
end
