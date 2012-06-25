class TagsController < ApplicationController
  def index
    render :json => current_user.tags 
  end

  # Create a new tag or attach tag to doc
  # For create, url:
  #   POST /tags?name=<name>
  # For attach, url:
  #   POST /metadata/<metadata_id>/tags?name=<name>
  def create
    # If given metadata_id ==> attach tag
    if params[:metadata_id]
      tag = current_user.attach_tag params[:metadata_id], params[:name]
    # Otherwise ==> create a new tag
    else
      tag = current_user.create_tag params[:name]
    end
    _respond_tag_request tag
  end

  # Destroy a tag or detach tag from doc
  # For destroy, url:
  #   DELETE  /tags/<tag_id>
  # For attach, url:
  #   DELETE  /metadata/<metadata_id>/tags/<id>
  def destroy
    # If given metadata_id ==> detach tag
    if params[:metadata_id]
      tag = current_user.detach_tag params[:metadata_id], params[:id]
    # Otherwise ==> delete tag
    else
      tag = current_user.delete_tag params[:id]
    end
    _respond_tag_request tag 
  end

  # Rename a tag
  #   PUT /tags/<id>/
  #   Request payload in JSON: {"name": <name>}
  def update
    tag = current_user.rename_tag params[:id], params[:name]
    _respond_tag_request tag
  end

  private 

  def _respond_tag_request tag
    if tag
        respond_to do |format| 
            format.html { head :no_content }
            format.json {
              tag_json = ActiveSupport::JSON.encode tag
              render :json => tag_json
            }
        end        
    else
        respond_to do |format| 
            format.html { head :no_content }
            format.json { 
              response = { :error => true }
              json = ActiveSupport::JSON.encode response
              render :json => json
            }
        end
    end 

  end
end
