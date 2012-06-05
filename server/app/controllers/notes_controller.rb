class NotesController < ApplicationController
    def index
        paper_id = params[:paper_id]
        p = Paper.find_by_id(paper_id)
        if params.has_key?(:user_id)
            user_id = params[:user_id]
            if(current_user.is_friend?(user_id) || current_user.id == user_id.to_i)
                result = p.getNotes :user_id=>user_id
            else
                render :json => {"error"=>"not your friend"}
                return
            end
        else
            result = p.getNotes :user_id=>current_user.id
        end
        if result != nil
          render :json => result
        else
          render :json => {}
        end
    end
    def create
        note = params[:note]
        note[:user_id] = current_user.id
        note = Note.new(params[:note])
        if note.save
          render :json => note
        else
          render :json => {}
        end
    end
    def show
        paper_id = params[:paper_id]
        p = Paper.find_by_id(paper_id)
        note_id = params[:id]
        note = p.notes.find_by_id(note_id)
        if note != nil
            render :json => note
        else
            render :json => {}
        end
    end
    def update
      u = current_user       
      note_id = params[:id]
      note = u.notes.find_by_id(note_id)
      if note!=nil
          result = note.update_attributes(params[:note])
          render :json => result
      else
        render :json => {}
      end
    end
    def destroy
      u = current_user
      note_id = params[:id]
      note = u.notes.find_by_id(note_id)
      if note!=nil
          result = note.delete 
          if note.destroyed?
            render :json => result
          else
            render :json => {}
          end
      else
        render :json => {}
      end
    end
end
