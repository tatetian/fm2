class Metadata < ActiveRecord::Base
  attr_accessible :abstract, :authors, :date, :docid, :paper_id, :publication, :title
  after_save { |doc| 
    
  }
 
  validates   :docid, presence: true
  validates   :paper_id, presence: true

  has_many    :collections, :foreign_key => "metadata_id", :dependent => :destroy
  has_many    :tags, :through => :collections
  belongs_to  :paper

  default_scope :order => 'docs.created_at DESC'
end
