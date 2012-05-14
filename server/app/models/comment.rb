class Comment < ActiveRecord::Base
  attr_accessible :content, :paper_id, :user_id
  
  belongs_to  :user
  belongs_to  :paper
  
  validates :user_id, presence: true
  validates :paper_id, presence: true
  validates :content, presence: true, length: { maximum: 500 }
end
