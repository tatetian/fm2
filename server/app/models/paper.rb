class Paper < ActiveRecord::Base
  attr_accessible :abstract, :authors, :content, :convert, :date, :docid, :publication, :title
  has_many :metadatas, dependent: :destroy

  validates   :docid, presence: true, uniqueness: {case_sensitive:true}
  validates   :title, presence: true
end
