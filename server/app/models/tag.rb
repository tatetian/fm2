class Tag < ActiveRecord::Base
  attr_accessible :name, :user_id
  validates :user_id, presence: true
  validates :name, presence: true, length: {maximum:100}

  belongs_to :user
  has_many :collections, foreign_key: "tag_id"
  has_many :metadatas, through: :collections

  default_scope order: 'tags.name ASC'
end
