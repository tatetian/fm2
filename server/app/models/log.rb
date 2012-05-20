class Log < ActiveRecord::Base
  attr_accessible :content, :from_id, :user_id
  belongs_to :user  
  
  validates :user_id, presence: true
  validates :from_id, presence: true
  validates :content, presence: true
end
