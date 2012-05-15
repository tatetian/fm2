class TagsController < ApplicationController
  def index
    render :json => current_user.tags 
  end

  def create
    tag = current_user.create_tag params[:name]
    _respond_tag_request tag
  end

  def destroy
    tag = current_user.delete_tag params[:id]
    _respond_tag_request tag 
  end

  def update
    tag = curent_user.rename_tag params[:id], params[:name]
    _respond_tag_request tag
  end

  private 

  def _respond_tag_request tag
    if tag
        respond_to do |format| 
            format.html { head :no_content }
            format.json {
              response = { :tag => tag }
              json = ActiveSupport::JSON.encode response
              render :json => json
            }
        end        
    else
        respond_to do |format| 
            format.html { head :no_content }
            format.json { 
              response = { :error => true, :tag => tag }
              json = ActiveSupport::JSON.encode response
              render :json => json
            }
        end
    end 

  end
end
