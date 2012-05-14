class Note < ActiveRecord::Base
  attr_accessible :content, :pagenum, :paper_id, :position, :user_id
  
  belongs_to  :user
  belongs_to  :paper
  
  validates :user_id, presence: true
  validates :paper_id, presence: true
  validates :content, presence: true
  
end
