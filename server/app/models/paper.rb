class Paper < ActiveRecord::Base
  attr_accessible :abstract, :authors, :content, :convert, :date, :docid, :publication, :title
  has_many :comments, dependent: :destroy
  has_many :metadatas, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :highlights, dependent: :destroy

  validates   :docid, presence: true, uniqueness: {case_sensitive:true}
  validates   :title, presence: true
  
  def getComments
      result = Comment.find_by_paper_id(self.id)
  end
  def getNotes(params={}) 
      if params.has_key?(:user_id)
          user_id = params[:user_id]
          notes = Note.all(:conditions=>{:user_id=>user_id,:paper_id=>self.id})
      else
          notes = self.notes
      end
  end
  def getHighlights(params={}) 
      if params.has_key?(:user_id)
          user_id = params[:user_id]
          result = Highlight.all(:conditions=>{:paper_id=>self.id,:user_id=>user_id})
      else
         result = self.highlights
      end
  end
end
