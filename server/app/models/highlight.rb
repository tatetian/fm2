class Highlight < ActiveRecord::Base
  attr_accessible :pagenum, :paper_id, :posfrom, :posto, :user_id
  belongs_to  :user
  belongs_to  :paper
  
  validates :user_id, presence: true
  validates :paper_id, presence: true
end
