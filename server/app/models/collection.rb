class Collection < ActiveRecord::Base
  attr_accessible :metadata_id, :tag_id

  validates   :tag_id, presence: true
  validates   :metadata_id, presence: true

  belongs_to  :tag
  belongs_to  :metadata
end
